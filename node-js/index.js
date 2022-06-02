const express = require('express');
const app = express();
const dotenv = require("dotenv");

// Load environment variables from the .env file
dotenv.config()

// Simple authorization middleware.  Add this function to each registered route to enable
// Bearer token authorization on your client.  Since your client service must be publicly
// accessible in order for IDN's event trigger service to send events to your client service,
// anyone on the internet can call your client service.  Authentication ensures that your client
// only acts on authorized requests from IDN.
const authorization = function(req, res, next) {
    if (req.headers['authorization'] && req.headers['authorization'] === `Bearer ${process.env.TOKEN}`) {
        return next()
    } else {
        res.status(401).json({
            error: "The token was missing or invalid."
        })
    }
}

app.use(express.json())

// By specifying a path when registering a route with express, a single client service can
// subscribe to multiple different event triggers.  The path can be named anything, and each
// path name must be unique.  Make sure to add the authorization function as middleware to protect
// your routes.
app.post('/identity-attributes-changed', authorization, function (req, res) {
    // This line prints the event data received by the trigger on the command line.
    // This is meant for debug purposes and should probably be removed once you are ready to 
    // deploy to production.
    console.log(`/identity-attributes-changed received a body with the following contents:\n ${JSON.stringify(req.body, null, 2)}`)
    
    // A fire and forget trigger must respond with a 200 and an empty body to signal back
    // to IDN that the event was received.
    res.status(200).send()
})

// Start the server on port 8081.  This port can be changed in case port 8081 is already in 
// use on the machine it is deployed on.
const server = app.listen(8081, function () {
    const host = server.address().address
    const port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
})