describe('Deferred', function () {
    var Deferred = require('../../Async/deferred');

    it('should run its callback when done.', function (done) {
        var deferred = new Deferred();

        deferred.complete();

        deferred.isComplete().should.be.true;

        deferred.onComplete(done);
    });

    it('should run its callback after done.', function (done) {
        var deferred = new Deferred();

        deferred.onComplete(done);

        deferred.complete();

        deferred.isComplete().should.be.true;
    });

    it('should run its callback when asynchronous.', function (done) {
        var deferred = new Deferred();

        setTimeout(function () {
            deferred.complete();
        }, 50);

        deferred.onComplete(function () {
            deferred.isComplete().should.be.true;
            done();
        });
    });

    it('should allow another Deferred to be linked with itself.', function (done) {
        var deferred = new Deferred();
        var secondDeferred = new Deferred();
        deferred.linkWith(secondDeferred);

        setTimeout(function () {
            secondDeferred.complete();
        }, 50);

        deferred.onComplete(function () {
            deferred.isComplete().should.be.true;
            secondDeferred.isComplete().should.be.true;

            done();
        });
    });

    it('should allow a chain of Deferreds to be linked with itself.', function (done) {
        var deferred = new Deferred();
        var secondDeferred = new Deferred();
        deferred.linkWith(secondDeferred);

        var thirdDeferred = new Deferred();
        thirdDeferred.onComplete(secondDeferred.complete);

        var fourthDeferred = new Deferred();
        fourthDeferred.onComplete(thirdDeferred.complete);

        setTimeout(function () {
            fourthDeferred.complete();
        }, 50);

        deferred.onComplete(function () {
            deferred.isComplete().should.be.true;
            secondDeferred.isComplete().should.be.true;
            thirdDeferred.isComplete().should.be.true;
            fourthDeferred.isComplete().should.be.true;

            done();
        });
    });

    it('should allow a chain of Deferreds that are linkedto be linked with itself.', function (done) {
        var deferred = new Deferred();
        var secondDeferred = new Deferred();
        deferred.linkWith(secondDeferred);

        var thirdDeferred = new Deferred();
        secondDeferred.linkWith(thirdDeferred);

        var fourthDeferred = new Deferred();
        thirdDeferred.linkWith(fourthDeferred);

        setTimeout(function () {
            fourthDeferred.complete();
        }, 50);

        deferred.onComplete(function () {
            deferred.isComplete().should.be.true;
            secondDeferred.isComplete().should.be.true;
            thirdDeferred.isComplete().should.be.true;
            fourthDeferred.isComplete().should.be.true;

            done();
        });
    });

    it('should be chainable.', function (done) {
        var deferred = new Deferred().onComplete(function () {}).complete().onComplete(function () {}).complete().onComplete(function () {
            deferred.isComplete().should.be.true;
            done();
        });
    });

    it('should run multiple callbacks when done.', function (done) {
        var deferred = new Deferred();

        deferred.complete();

        var count = 0;

        var callDoneWhenDone = function (numberOfTimesToCall) {
            return function () {
                count++;
                if (count === numberOfTimesToCall) {
                    deferred.isComplete().should.be.true;
                    done();
                }
            };
        };

        deferred.onComplete(callDoneWhenDone(3));
        deferred.onComplete(callDoneWhenDone(3));
        deferred.onComplete(callDoneWhenDone(3));
    });

    it('should run multiple callbacks when asynchronous.', function (done) {
        var deferred = new Deferred();

        var count = 0;

        var callDoneWhenDone = function (numberOfTimesToCall) {
            return function () {
                count++;
                if (count === numberOfTimesToCall) {
                    deferred.isComplete().should.be.true;
                    done();
                }
            };
        };

        deferred.onComplete(callDoneWhenDone(3));
        deferred.onComplete(callDoneWhenDone(3));

        setTimeout(function () {
            deferred.complete();
        }, 30);

        deferred.onComplete(callDoneWhenDone(3));
    });

    it('should run multiple callbacks when asynchronous and done.', function (done) {
        var deferred = new Deferred();

        var count = 0;

        var callDoneWhenDone = function (numberOfTimesToCall) {
            return function () {
                count++;
                if (count === numberOfTimesToCall) {
                    deferred.isComplete().should.be.true;
                    done();
                }
            };
        };

        deferred.onComplete(callDoneWhenDone(3));

        setTimeout(function () {
            deferred.complete();
            deferred.onComplete(callDoneWhenDone(3));
        }, 30);

        deferred.onComplete(callDoneWhenDone(3));
    });

    it('should run the callbacks only once.', function (done) {
        var deferred = new Deferred();

        var count = 0;
        var increment = function () {
            count++;
        };

        deferred.complete();

        deferred.onComplete(increment);

        deferred.complete();

        setTimeout(function () {
            count.should.equal(1);
            deferred.isComplete().should.be.true;
            done();
        }, 10);
    });

    describe('#chain()', function () {
        var chainedDeferred = function (counter) {
            var deferred = new Deferred();

            setTimeout(function () {
                deferred.complete(counter + 1);
            }, 20);

            return deferred;
        };

        var completionDeferred = function (done, expectedCounterResult) {
            return function (counter) {
                var deferred = new Deferred();

                setTimeout(deferred.complete, 20);

                deferred.onComplete(function () {
                    counter.should.equal(expectedCounterResult);
                    done();
                });

                return deferred;
            };
        };

        describe('deferreds', function () {
            it('should run a single deferred.', function (done) {
                Deferred.chain(completionDeferred(done, 0));
            });

            it('should chain multiple deferreds.', function (done) {
                Deferred.chain(chainedDeferred, chainedDeferred, completionDeferred(done, 2));
            });

            it('should chain multiple deferreds when passed as an array.', function (done) {
                Deferred.chain([chainedDeferred, chainedDeferred, completionDeferred(done, 2)]);
            });
        });

        var chainedFunction = function (counter, next) {
            setTimeout(function () {
                next(counter + 1);
            }, 20);
        };

        var completionFunction = function (done, expectedCounterResult) {
            return function (counter) {
                counter.should.equal(expectedCounterResult);
                done();
            };
        };

        describe('functions', function () {
            it('should run a single function.', function (done) {
                Deferred.chain(completionFunction(done, 0));
            });

            it('should chain multiple functions.', function (done) {
                Deferred.chain(chainedFunction, chainedFunction, completionFunction(done, 2));
            });
        });

        describe('mixed', function () {
            it('should chain multiple functions and deferreds, ending with a deferred.', function (done) {
                Deferred.chain(
                    chainedDeferred,
                    chainedFunction,
                    chainedDeferred,
                    chainedFunction,
                    completionDeferred(done, 4));
            });
            it('should chain multiple functions and deferreds, ending with a function.', function (done) {
                Deferred.chain(
                    chainedFunction,
                    chainedDeferred,
                    chainedFunction,
                    chainedDeferred,
                    completionFunction(done, 4));
            });
        });
    });

    describe('#when()', function () {
        var counter;

        var chainedDeferred = function () {
            var deferred = new Deferred();

            setTimeout(function () {
                counter++;
                deferred.complete();
            }, 20);

            return deferred;
        };

        var completionDeferred = function (done, expectedCounterResult) {
            return function () {
                var deferred = new Deferred();

                setTimeout(deferred.complete, 20);

                deferred.onComplete(function () {
                    counter.should.equal(expectedCounterResult);
                    done();
                });

                return deferred;
            };
        };

        describe('deferreds', function () {
            beforeEach(function () {
                counter = 0;
            });

            it('should finish immediately if only a callback is passed.', function (done) {
                Deferred.when(done);
            });

            it('should run a single deferred.', function (done) {
                Deferred.when(completionDeferred(done, 0));
            });

            it('should chain multiple deferreds.', function (done) {
                Deferred.when(chainedDeferred, chainedDeferred, completionDeferred(done, 2));
            });

            it('should chain multiple deferreds passed as an array.', function (done) {
                Deferred.when([chainedDeferred, chainedDeferred], completionDeferred(done, 2));
            });
        });

        var chainedFunction = function (callback) {
            setTimeout(function () {
                counter++;
                callback();
            }, 20);
        };

        var completionFunction = function (done, expectedCounterResult) {
            return function () {
                counter.should.equal(expectedCounterResult);
                done();
            };
        };

        describe('functions', function () {
            beforeEach(function () {
                counter = 0;
            });

            it('should run a single function.', function (done) {
                Deferred.when(completionFunction(done, 0));
            });

            it('should chain multiple functions.', function (done) {
                Deferred.when(chainedFunction, chainedFunction, completionFunction(done, 2));
            });
        });

        describe('array input', function () {
            beforeEach(function () {
                counter = 0;
            });

            it('should return immediately if an empty array is passed.', function (done) {
                Deferred.when([], done);
            });

            it('should accept arguments as an array.', function (done) {
                Deferred.when(
                [chainedDeferred,
                    chainedFunction,
                    chainedDeferred,
                    chainedFunction],
                    completionDeferred(done, 4));
            });
        });

        describe('mixed', function () {
            beforeEach(function () {
                counter = 0;
            });

            it('should chain multiple functions and deferreds, ending with a deferred.', function (done) {
                Deferred.when(
                    chainedDeferred,
                    chainedFunction,
                    chainedDeferred,
                    chainedFunction,
                    completionDeferred(done, 4));
            });

            it('should chain multiple functions and deferreds, ending with a function.', function (done) {
                Deferred.when(
                    chainedFunction,
                    chainedDeferred,
                    chainedFunction,
                    chainedDeferred,
                    completionFunction(done, 4));
            });
        });
    });
});
