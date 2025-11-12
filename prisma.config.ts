import { defineConfig } from '@prisma/cli'import { defineConfig, env } from "prisma/config";



export default defineConfig({export default defineConfig({

  schema: './prisma/schema.prisma',  schema: "prisma/schema.prisma",

  migrations: {  migrations: {

    path: './prisma/migrations'    path: "prisma/migrations",

  }  },

})  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
