const { CognitoJwtVerifier } = require("aws-jwt-verify");

const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: "us-east-1_qAN9MfFEG",
    tokenUse: "id",
    clientId: "6c2fnnqtl3dma372r5q39jl1ju"
})


const generatePolicy = (principalId, effect, resource) => {
    var authReponse = {};
    authReponse.principalId = principalId;
    if (effect && resource) {
        let policyDocument = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: effect,
                    Resource: resource,
                    Action: "execute-api:Invoke",
                },
            ],
        };
        authReponse.policyDocument = policyDocument;
    }
    authReponse.context = {
        foo: "bar",
    };
    console.log(JSON.stringify(authReponse));
    return authReponse;
};

exports.handler = async (event, context, callback) => {
    //Lambda authorizer
    var token = event.authorizationToken //allow or deny
    console.log(token);
    try {
        const payload = await jwtVerifier.verify(token);
        console.log(JSON.stringify(payload));
        callback(null, generatePolicy("user", "Allow", event.methodArn));
      } catch(err) {
        callback("Error: Invalid token");
      }

}