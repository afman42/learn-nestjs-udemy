import { Body, Controller, Post, Get, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor,Session, UseGuards} from '@nestjs/common';
import { updateUserDto } from './dto/update-dto.dto.ts'
import { createUserDto } from './dto/create-user.dto'
import { UsersService } from './users.service'
import { Serialize } from '../interceptors/serialize.interceptor'
import { userDto } from './dto/user.dto'
import { AuthService } from './auth.service'
import { CurrentUser } from './decorators/current-user.decorator'
import { User } from './users.entity'
import { AuthGuard } from '../guards/auth.guard'

@Controller('auth')
@Serialize(userDto)
export class UsersController {
	constructor(
		private usersService: UsersService,
		private authService: AuthService
	){}

	//@Get('/whoami')
	//whoAmi(@Session() session:any){
		//return this.usersService.findOne(session.userId);
	//}

	@Get('/whoami')
	@UseGuards(AuthGuard)
	whoAmi(@CurrentUser() user: User){
		return user
	}
	
	@Post('/signout')
	signOut(@Session(), session:any){
		session.userId = null
	}

	@Post('/signup')
	async createUser(@Body() body: createUserDto, @Session() session:any){
		const user = await this.authService.signup(body.email, body.password)
		session.userId = user.id
		return user
	}
	
	@Post('/signin')
	async signin(@Body body:createUserDto, @Session() session:any){
		const user = await this.authService.signin(body.email,body.password)
		session.userId = user.id
		return user;
	}

	//@UseInterceptors(new SerializeInterceptor(userDto))
	@Get('/:id')
	findUser(@Param('id') id:string){
		return this.usersService.findOne(parseInt(id))
	}

	@Get()
	findAllUsers(@Query('email') email:string){
		return this.usersService.find(email)
	}
	
	@Delete('/:id')
	removeUser(@Param('id') id:string){
		return this.usersService.remove(parseInt(id))
	}
	
	@Patch('/:id')
	updateUser(@Param('id') id:string, @Body() body: updateUserDto){
		return this.usersService.update(parseInt(id), body)
	}
}
