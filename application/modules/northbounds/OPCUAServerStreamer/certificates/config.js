"use strict";
// ---------------------------------------------------------------------------------------------------------------------
module.exports =  {

    subject: {
        commonName:         "NodeOPCUA-TEST",
        organization:       "NodeOPCUA",
        organizationUnit:   "Unit",
        locality:           "Paris",
        state:              "IDF",
        country:            "FR" // Two letters
    },

    validity:           365 * 15, // 15 years

    keySize:            2048 // default private key size
};
