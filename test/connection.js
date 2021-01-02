
process.env.NODE_ENV = 'OPEN ACCESS TEST';

var chai = require("chai");
var expect  = chai.expect;
var should = chai.should();
var chaiHttp = require("chai-http");
chai.use(chaiHttp);

var request = require('request');
var server = require("../open_access");



describe ("Connections", function(){
    this.timeout(50000);
    describe ("Swagger API", function() {
        it("Settings", done=>{
            request("http://localhost:55554/api/v1/setting" , function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    
        it("Variables", done=>{
            request("http://localhost:55554/api/v1/variables" , function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });
});