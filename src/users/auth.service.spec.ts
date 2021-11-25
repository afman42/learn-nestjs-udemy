import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    //Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => email === user.email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('create a new with salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if use signs up with email that is in use', async (done) => {
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'a', password: 'b' } as User]);
    try {
      await service.signup('asdf@asdf.com', 'asd');
    } catch (er) {
      done();
    }
  });

  it('throws if signin is called with an unused email', async (done) => {
    try {
      await service.signin('asdf@asdf.com', 'asdf');
    } catch (err) {
      done();
    }
  });

  it('throws if an invalid password is provided', async (done) => {
    fakeUsersService.find = () =>
      Promise.resolve([{ email: 'asdf@asdf.com', password: 'asdf' } as User]);
    try {
      await service.signin('asdf@asdf.com', 'asdf');
    } catch (err) {
      done();
    }
  });

  it('returns a user if correct password  is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        {
          email: 'asdf@asdf.com',
          password: 'asdf',
        } as User,
      ]);

    const user = await service.signin('asdf@asdf.com', 'asdf');
    expect(user).toBeDefined();
  });
});
