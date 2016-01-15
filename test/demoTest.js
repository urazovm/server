var app = require('../class/StatsManagerClass'),
    should = require('should'),
    supertest = require('supertest');



describe('test', function() {
    // beforeEach(function)
    
    it("method 1", function(done) {
        // var m = new app({test: 1, test: 2});
        var m = new app({test: 1, test: 2});
        console.log(m.should.__proto__);
        m.should.hasOwnProperty('test');
        done();
    });
    it('method 2', function(done) {
        // throw "don't pass";
       
        done();
    });
    
});