"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = __importStar(require("body-parser"));
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const checkJwt_1 = require("../src/middlewares/checkJwt");
const Account_1 = __importDefault(require("../src/database/models/Account"));
const auth_1 = __importDefault(require("../src/routes/auth"));
// lol this is a stupid bad idiot test
test('registers user', async (done) => {
    process.env.ACCESS_TOKEN_SECRET = '69696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969';
    const router = auth_1.default({
        getRepository: (constructor) => {
            // TODO: eliminate this assertion
            expect(constructor).toBe(Account_1.default);
            return {
                save: async function (user) {
                    expect(user.username).toBe('John Doe');
                    user.id = 'super cool user ::)';
                    return user;
                }
            };
        }
    });
    const app = express_1.default();
    app.use(bodyParser.json());
    app.use('/', router);
    const response = await supertest_1.default(app).post('/register')
        .send({ username: 'John Doe' });
    expect(response.status).toBe(200);
    done();
});
test('logs user in', async (done) => {
    process.env.ACCESS_TOKEN_SECRET = '69696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969';
    const router = auth_1.default({
        getRepository: (constructor) => {
            // TODO: eliminate this assertion
            expect(constructor).toBe(Account_1.default);
            return {
                findOneOrFail: async function (clause) {
                    expect(typeof clause).not.toBe(typeof undefined);
                    expect(clause.username).toBe('John Doe');
                    const user = new Account_1.default();
                    user.id = 'ecks dee';
                    user.username = 'John Doe';
                    return user;
                }
            };
        }
    });
    const app = express_1.default();
    app.use(bodyParser.json());
    app.use('/', router);
    await supertest_1.default(app)
        .post('/login')
        .send({ username: 'John Doe' })
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
        expect(typeof response.body.token).toBe(typeof "");
        expect(response.body.token.length).toBeGreaterThan(20);
        return checkJwt_1.verifyJwt(response.body.token);
    })
        .then(payload => {
        expect(payload.id).toBe('ecks dee');
    });
    done();
});
