# PIXELA WORLDEND FC

##Developer manual

### Steps to setup project for developers
Clone our repository to your pc
Make two terminals by using the `cd` command



# FrontEnd
### CLI
  - Run `cd FrontEnd`
  - Run `npm install`
  - Run `npm run dev`

### Essential folders

  - **FrontEnd\public\img** this folder contains several images in .png or .jpg format that we’ve been used throughout this website
  - **FrontEnd\src\app\globals.css** This css file applies styles universally across the site, You can modify your css in the ‘globals.css`
  - **FrontEnd\src\app\components** this folder contains components from shadcn, to learn more [click here](https://ui.shadcn.com/) 

# BackEnd
### In CLI
  - Run `cd BackEnd`
  - Run `npm i`

### Edit the `.env.test` file
  - Change name to `.env`
  - Setup the variables in it { From discord-backend channel }

### Essential folders
**BackEnd\src\api** this folder contains essential codes for the backend services such as; api routes, websockets, and utility functions
      - **BackEnd\src\api\routes** this folder contains all of the RESTful API routes, most of which are called by the frontend side of the app
      - **BackEnd\src\api\utils** this folder contains all of the utility functions used in the API
      - **BackEnd\src\api\middleware** this folder contains all of the global middlewares used in the API, such as; authentication check, role check, and passport middleware
      - **BackEnd\src\api\websocket** this folder contains the websocket server setup, and it functions

## Setup database(& backend in the future)

- In CLI

  - Run `docker compose up -d`
  - Run `npm run db:migrate`

### Setup appuser in database

- In CLI

  - Run `docker exec -it g6-database bash`
  - Run `psql -U postgres -d pixela_worldend`

  - Set all the variables in the command correctly

  ```
  REVOKE CONNECT ON DATABASE pixela_worldend FROM public;
  REVOKE ALL ON SCHEMA public FROM PUBLIC;
  CREATE USER appuser WITH PASSWORD '69secret';
  CREATE SCHEMA drizzle;
  GRANT ALL ON DATABASE pixela_worldend TO appuser;
  GRANT ALL ON SCHEMA public TO appuser;
  GRANT ALL ON SCHEMA drizzle TO appuser;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO appuser;
  ```

# Setup notification in database (Important!)

- In CLI
  - Run `npm run db:setup`

# Seeding database

- In CLI

  - Run `npm run db:seed` to seed all the necessary relations

  - Run `npm run db:seedVtuber` to seed vtubers to database
  - Run `npm run db:seedMemberShip` to seed memberShipTiers to database
  - Run `npm run db:seedLiveCategory` to seed liveStreamCategories to database
