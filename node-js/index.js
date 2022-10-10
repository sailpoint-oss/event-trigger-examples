const express = require("express");
const app = express();
const dotenv = require("dotenv");
const axios = require("axios").default;

// Load environment variables from the .env file
dotenv.config();

// Simple authorization middleware.  Add this function to each registered route to enable
// Bearer token authorization on your client.  Since your client service must be publicly
// accessible in order for IDN's event trigger service to send events to your client service,
// anyone on the internet can call your client service.  Authentication ensures that your client
// only acts on authorized requests from IDN.
const authorization = function (req, res, next) {
  if (
    req.headers["authorization"] &&
    req.headers["authorization"] === `Bearer ${process.env.TOKEN}`
  ) {
    return next();
  } else {
    res.status(401).json({
      error: "The token was missing or invalid.",
    });
  }
};

app.use(express.json());

// By specifying a path when registering a route with express, a single client service can
// subscribe to multiple different event triggers.  The path can be named anything, and each
// path name must be unique.  Make sure to add the authorization function as middleware to protect
// your routes.
app.post("/identity-attributes-changed", authorization, function (req, res) {
  // This line prints the event data received by the trigger on the command line.
  // This is meant for debugging purposes and should probably be removed once you are ready to
  // deploy to production.
  console.log(
    `/identity-attributes-changed received a body with the following contents:\n ${JSON.stringify(
      req.body,
      null,
      2
    )}`
  );

  // A fire and forget subscription should respond with a 200 and an empty body to signal back
  // to IDN that the event was received.
  res.status(200).send();

  // Perform your event handling logic after the response.
});

// This is an example of how to handle a REQUEST_RESPONSE type trigger using the SYNC
// dispatch mode.  A SYNC dispatch mode requires the subscriber to respond within 10 seconds
// of receiving the event, otherwise, the access request will proceed as normal.  SYNC is
// typically used in scenarios where you can automatically determine the action to take on an
// event based on the data received in the event payload.
app.post(
  "/sync-access-request-preapproval",
  authorization,
  function (req, res) {
    // This line prints the event data received by the trigger on the command line.
    // This is meant for debugging purposes and should probably be removed once you are ready to
    // deploy to production.
    console.log(
      `/sync-access-request-preapproval received a body with the following contents:\n ${JSON.stringify(
        req.body,
        null,
        2
      )}`
    );

    // This response is hardcoded to always approve the access request.  In reality,
    // you will want to perform additional logic or call other APIs to determine whether
    // to approve or deny the request.
    const res_body = {
      approved: true,
      comment: "This request was autoapproved by our automated ETS subscriber.",
      approver: "Automated AR Approval",
    };

    // Return the decision to approve/deny the AR back to the IDN event trigger service.
    res.status(200).send(res_body);
  }
);

// This is an example of how to handle a REQUEST_RESPONSE type trigger using the ASYNC
// dispatch mode.  An ASYNC dispatch mode requires the subscriber to respond with a 200 status
// code and an empty response body within 10 seconds of receiving the event, otherwise,
// the access request will proceed as normal.  Next, the subscriber will have until the
// configured response deadline to determine how to respond to the ETS event.  ASYNC is
// typically used in scenarios where you need additional processing time or need to involve
// humans or outside processes to determine how to proceed with the event.  The deadline
// for responding to an ASYNC event can be configured in the subcription configuration in IDN.
app.post(
  "/async-access-request-preapproval",
  authorization,
  function (req, res) {
    // This line prints the event data received by the trigger on the command line.
    // This is meant for debugging purposes and should probably be removed once you are ready to
    // deploy to production.
    console.log(
      `/async-access-request-preapproval received a body with the following contents:\n ${JSON.stringify(
        req.body,
        null,
        2
      )}`
    );

    // Respond with a 200 and empty JSON object to inform IDN that the event was received and is
    // being processsed.
    res.status(200).send({});

    // Pass the payload data to a function that will handle the processing of the event.
    // This function will need to make an HTTP call using the URL and secret provided
    // in the payload, along with the decision payload, within the deadline configured
    // in the subcription.
    processAccessRequest(req.body);
  }
);

// This is an example of how to handle a REQUEST_RESPONSE type trigger using the DYNAMIC
// dispatch mode.  A DYNAMIC dispatch mode allows the subscriber to determine how to
// respond on a per event basis.  If the subscriber can determine what action to take
// on an event within 10 seconds of receiving the event, then it can respond synchronously
// by responding with a 200 status code and the appropriate respond body with the decision.
// If the subcriber needs more than 10 seconds to determine how to respond, then it can
// follow an asynchronous response by responding with a 202 status code with an empty body
// and then use the URL and secret provided in the event payload to respond at a later
// date and time.
app.post(
  "/dynamic-access-request-preapproval",
  authorization,
  function (req, res) {
    // This line prints the event data received by the trigger on the command line.
    // This is meant for debugging purposes and should probably be removed once you are ready to
    // deploy to production.
    console.log(
      `/dynamic-access-request-preapproval received a body with the following contents:\n ${JSON.stringify(
        req.body,
        null,
        2
      )}`
    );

    // For demonstration purposes, use a simple flag to respond sync vs async.  In a real
    // implementation, this logic will incorporate data from the event to determine
    // which mode to respond in.
    const sync_response = true;
    if (sync_response) {
      const res_body = {
        approved: true,
        comment:
          "This request was autoapproved by our automated ETS subscriber.",
        approver: "Automated AR Approval",
      };
      res.status(200).send(res_body);
    } else {
      // Respond with a 202 and empty JSON object to inform IDN that the event was received.
      // Call additional function(s) to further process the event and respond using
      // the callback URL provided in the event body.
      res.status(202).send({});
      processAccessRequest(req.body);
    }
  }
);

// To process the access request, kick off any processes necessary to make a decision
// based on the event data.  Once a decision has been made, use the URL and secret
// provided in the _metadata property of the event to respond to IDN with the decision.
function processAccessRequest(event) {
  axios
    .post(event["_metadata"].callbackURL, {
      secret: event["_metadata"].secret,
      output: {
        approved: true,
        comment:
          "This request was autoapproved by our automated ETS subscriber.",
        approver: "Automated AR Approval",
      },
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
}

// Start the server on port 8081.  This port can be changed in case port 8081 is already in
// use on the machine it is deployed on.
const server = app.listen(8081, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});
