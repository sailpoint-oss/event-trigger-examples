# Node.js Event Trigger Client

This folder contains an example event trigger client implemented as an express server in Node.js.  It provides code stubs to demonstrate how to process a `FIRE_AND_FORGET` trigger type, as well as how to process a `REQUEST_RESPONSE` trigger for the `sync`, `async`, and `dynamic` response modes.

## Setup

You will need to install the following software in order to use this application.

- [Node.js](https://nodejs.org/en/download/)
- [ngrok](https://ngrok.com/download) (for local testing)

Once you have Node.js installed, open this folder in your terminal and run the following command to install the packages needed to run this application.

```sh
npm install
```

Once the packages are installed, run the following command to start the server.

```sh
npm start
```

This should start the server at `localhost:8081`.

## Configuration

Start by creating a file called ".env".  This is an environment file that will hold secret configuration information needed by the server to run.  Within your ".env" file, provide a randomly generated string of characters in the `TOKEN` field to enable authentication on the server.

```text
TOKEN="<random string>"
```

When subscribing to an event trigger in the IDN UI, set the **Authentication Type** to **Bearer Token** and paste your token into the text box.  This will instruct IDN to send your secret token along with each event that the trigger generates.  This example app has an authentication function that will check each event received by IDN has the correct token before processing the request.

> Note: Event trigger subscribers don't need to implement authentication, and the authentication logic in this example app can be removed if desired.  However, it is best practice to perform authentication since your subscriber will be public to the internet and you want to ensure that you only process requests that are sent by an authorized service.

## Testing Locally

To test the trigger client, make sure the server is running and then send a POST request to one of the configured endpoints in `index.js`.  You can use the following cURL command to test the client.

```sh
curl --location --request POST 'localhost:8081/identity-attributes-changed' --header 'Content-Type: application/json' --data-raw '{"data": "hello world!"}'
```

The client should respond with a 200 (OK) and an empty request body.  The request body you sent should be logged in the terminal window.

## Testing Using ngrok

[ngrok](https://ngrok.com/) is a tool that allows you to easily tunnel web traffic to your computer as if it were a public web server.  This tool makes it extremely easy to test your client service on your local machine while using live event data from IdentityNow.  Generally speaking, this tool is safe to use for testing purposes, but please consult your network team first to make sure it is acceptable to use within your company's network.  You may need to engage your network team if the [corporate firewall blocks web tunneling](https://ngrok.com/docs/guides/running-behind-firewalls) tools like ngrok to make an exception for your use case.

If you have ngrok installed, run the following command to start a tunnel to the port that your client service is running on.

```sh
ngrok http 8081
```

If ngrok successfully connects, you should see a forwarding IP address that you can use when subscribing to an event trigger in IDN.

```text
ngrok                                                                                                                               (Ctrl+C to quit)
                                                                                                                                                    
Session Status                online                                                                                                                
Account                       John Doe (Plan: Free)                                                                                           
Update                        update available (version 3.0.4, Ctrl-U to update)                                                                    
Version                       3.0.3                                                                                                                 
Region                        United States (us)                                                                                                    
Latency                       42.401835ms                                                                                                           
Web Interface                 http://127.0.0.1:4040                                                                                                 
Forwarding                    https://23bf-55-55-55-555.ngrok.io -> http://localhost:8081                                                           
                                                                                                                                                    
Connections                   ttl     opn     rt1     rt5     p50     p90                                                                           
                              0       0       0.00    0.00    0.00    0.00      
```

This output shows us that any request sent to `https://23bf-55-55-55-555.ngrok.io` will be redirected to your server running at `localhost:8081`.  You can try this for yourself by running the following cURL command, replacing the hostname with the one provided to you by ngrok.

```sh
curl --location --request POST 'https://23bf-55-55-55-555.ngrok.io/identity-attributes-changed' --header 'Content-Type: application/json' --data-raw '{"data": "hello world!"}'
```

Now you can configure a trigger subscription in IDN to use this public IP address to send live event trigger data directly to your local machine for testing purposes.  Just paste `https://23bf-55-55-55-555.ngrok.io/identity-attributes-changed` into the **Integration URL** text box when subscribing to a trigger.

> Note: ngrok will generate a random URL each time it is started.  You will need to update your trigger subscription with the new URL generated by ngrok each time you run it.
