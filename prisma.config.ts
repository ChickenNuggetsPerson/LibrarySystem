import { defineConfig } from '@prisma/config';

export default defineConfig({
    datasource: {
        url: 'file:./data/database.sqlite',
    },
});
