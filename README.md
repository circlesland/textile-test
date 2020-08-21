# textile-test
Contains an implementation of the examples from https://docs.textile.io/tutorials/hub/production-auth/ and some simple wrappers over the original api.
Uses the newest version of koa as of 21.08.2020 (2.11.4).

# Setup
You will need to supply a .env file with the following variables:
* USER_API_KEY=jf2jf920f...
* USER_API_SECRET=u30fj3f9j...
* PORT=2345

If you dont use a tool like dotenv make sure that you set them as environment variables prior to launch because otherwise the server will stop without further notice.
