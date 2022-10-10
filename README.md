# SailPoint Event Trigger Example Applications

There are many ways to consume event triggers, such as through no-code platforms like [Zapier](https://zapier.com) or using managed services like [AWS Event Bridge](https://developer.sailpoint.com/discuss/t/aws-event-bridge-and-sailpoint-event-triggers/258).  These services make it very easy to set up a subscription to an event trigger and begin processing events, but they often require paid subscriptions and may have inherit limitations that make it difficult to fulfill special use cases.  If you need flexibility in what you build, how you build it, and where you host it, then custom web services can fulfill those needs.

A web service is software that makes itself available over the internet and uses a standardized message format, like JSON, to communicate with clients.  SailPoint's event triggers send event data to subscribed services over the internet using JSON as the message format.  Web services can be implemented in nearly any programming language, and they can be deployed on privately owned machines or through managed service providers.  Sometimes, the flexibility of controlling the language, implementation details, and deployment location of custom web services is preferable to using managed services.

This repository provides concrete examples of how to implement custom services that can consume SailPoint event triggers.  Each language has its own folder and directions for installation and usage.  This code is a supplement to the [official event trigger documentation](https://developer.sailpoint.com/triggers/getting_started.html) from SailPoint.

## Contributing to this repository

If you would like to suggest an enhancement or report a bug, please create an appropriate issue on this repository.  If you would like to contribute to this repository, please follow [GitHub's guidelines for contributing to open source projects](https://docs.github.com/en/get-started/quickstart/contributing-to-projects).
