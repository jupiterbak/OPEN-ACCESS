/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/southbounds/dummyClient.js
 * Project: SP 142
 * Author:
 *  - Jupiter Bakakeu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * --------------------------------------------------------------------
 * ###################### Changes #####################################
 * -- 28.11.2016
 *      Initial implementation
 * --------------------------------------------------------------------
 **/

var when = require('when');
var template = require("./_container");

var powerContainer = function(settings) {
    if (!(this instanceof powerContainer))
        return new powerContainer(settings);
    template.call(this, settings);

    // Define the inputs
    this.addInput("I", "I(A)", "real", "A", 0.0);
    this.addInput("U", "U(V)", "real", "U", 0.0);

    // Define the outputs
    this.addOutput("P", "P(W)", "real", "W", 0.0);

    // Define the 
    this.compute = function(input_datas, output_datas) {
        //this.log("Compute I = " + input_datas["I"] + "; U = " + input_datas["U"]);
        output_datas["P"] = input_datas["I"] * input_datas["U"];
    };

};

module.exports = powerContainer;