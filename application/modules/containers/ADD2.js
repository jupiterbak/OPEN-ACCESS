/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/southbounds/ADD.js
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

var ADD2 = function(settings) {
    if (!(this instanceof ADD2))
        return new ADD2(settings);
    template.call(this, settings);

    // define the inputs
    this.addInput("a", "", "real", "", 0.0);
    this.addInput("b", "", "real", "", 0.0);

    // Define the outputs
    this.addOutput("c", "", "real", "", 0.0);


    this.compute = function(input_datas, output_datas) {
        //this.log("ADD: a = " + input_datas["a"] + "; b = " + input_datas["b"]);
        output_datas["c"] = input_datas["a"] + input_datas["b"];
    };
};

module.exports = ADD2;