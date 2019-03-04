const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const moongoose = require('mongoose');
const _ = require('lodash');
let server;

describe('/api/genres', () => {
    beforeEach(() => {
        server = require('../../index');
    });

    afterEach(async () => {
        server.close();
        await Genre.remove({});
    });

    describe('GET /', () => {
        it('should return all genres', async () => {
            const genres = [
                { name: 'genre1' },
                { name: 'genre2' }
            ]
            await Genre.insertMany(genres);

            const res = await request(server).get('/api/genres');

            // Only pick the 'name' properties to compare
            const pickProperties = _.partialRight(_.pick, ['name']);
            expect(res.status).toBe(200);
            expect(_.map(res.body, pickProperties)).toEqual(_.map(genres, pickProperties));
        });
    });

    describe('GET /:id', () => {
        it('should return a genre if valid id is passed', async () => {
            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            const res = await request(server).get(`/api/genres/${genre._id}`);

            // Only pick the 'name' properties to compare
            const propertiesToFilter = ['name'];
            expect(res.status).toBe(200);
            expect(_.pick(res.body, propertiesToFilter)).toMatchObject(_.pick(genre, propertiesToFilter));
        });

        it('should return 404 if invalid id is passed', async () => {
            const res = await request(server).get(`/api/genres/1`);

            expect(res.status).toBe(404);
        });

        it('should return 404 if no genre with the given id exists', async () => {
            const res = await request(server).get(`/api/genres/${moongoose.Types.ObjectId()}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {

        let token;
        let name;

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        });

        const exec = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name });
        }

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if the genre is less than 5 characters', async () => {
            token = new User().generateAuthToken();
            name = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if the genre is more than 50 characters', async () => {
            name = new Array(52).join('a')

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save the genre if it is valid', async () => {
            await exec();
            const genre = await Genre.find({ name: 'genre1' });
            expect(genre).not.toBeNull();
        });

        it('should return the genre if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        });
    });

    describe('DELETE /:id', () => {
        let isAdmin;
        let genre;

        beforeEach(async () => {
            genre = new Genre({ name: 'genre1' });
            isAdmin = true;
            token = new User({ isAdmin }).generateAuthToken();
            await Genre.create(genre);
        });

        const exec = async () => {
            return await request(server)
                .delete(`/api/genres/${genre._id}`)
                .set('x-auth-token', token)
        }

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if client is logged in but not admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken();

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should not delete genre if client is not admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken();

            const res = await exec();

            const fetchedGenre = await Genre.findById(genre._id);

            expect(res.status).toBe(403);
            expect(fetchedGenre).not.toBeNull();
        });

        it('should return 404 if no genre with the given id exists', async () => {
            genre._id = moongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should delete genre with the given id genre exists', async () => {
            const res = await exec();

            expect(res.status).toBe(200);

            const fetchedGenre = await Genre.findById(genre._id);

            expect(fetchedGenre).toBeNull();
        })
    })

    describe('PUT /:id', () => {
        let isAdmin;
        let genre;
        let newName;

        beforeEach(async () => {
            name = 'genre1'
            isAdmin = true;
            newName = 'updateGenre';
            genre = new Genre({ name: 'genre1' });
            token = new User({ isAdmin }).generateAuthToken();
            await Genre.create(genre);
        });

        const exec = async () => {
            return await request(server)
                .put(`/api/genres/${genre._id}`)
                .set('x-auth-token', token)
                .send({ name: newName });
        }

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if client is logged in but not admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken();

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should not update genre if client is not admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken();

            const res = await exec();

            const fetchedGenre = await Genre.findById(genre._id);

            expect(res.status).toBe(403);
            expect(fetchedGenre).toHaveProperty('name', 'genre1');
        });

        it('should return 404 if no genre with the given id exists', async () => {
            genre._id = moongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 400 if genre\'s name null', async () => {
            newName = null;

            const res = await exec();

            expect(res.status).toBe(400);
        })

        it('should return 400 if genre\'s name is less than 5 characters', async () => {
            newName = '1';

            const res = await exec();

            expect(res.status).toBe(400);
        })

        it('should return 400 if genre\'s name is more than 50 characters', async () => {
            newName = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        })

        it('should update genre\'s name with the given id genre exists', async () => {
            const res = await exec();

            expect(res.status).toBe(200);

            const fetchedGenre = await Genre.findById(genre._id);

            expect(fetchedGenre).toHaveProperty('name', newName);
        })
    })
});