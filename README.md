# PIXELA WORLDEND FC

##Developer manual

### Steps to setup project for developers
Clone our repository to your pc
Make two terminals by using the `cd` command



# FrontEnd
### CLI
`cd FrontEnd`
`npm install`
`npm run dev`

### Essential folders

**FrontEnd\public\img** this folder contains several images in .png or .jpg format that we’ve been used throughout this website
      -	**FrontEnd\src\app\page.tsx** 
      -     **FrontEnd\src\app\globals.css** 
      -	**FrontEnd\src\app\components** this folder contains components from shadcn, to learn more click here

# BackEnd
## To start

- In CLI
  - Run `cd BackEnd`
  - Run `npm i`

- Edit the `.env.test` file

  - Change name to `.env`
  - Setup the variables in it { From discord-backend channel }

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
