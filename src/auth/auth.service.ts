import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository, In } from 'typeorm';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Rol } from '../roles/rol.entity';


@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        @InjectRepository(Rol) private rolesRepository: Repository<Rol>,

        private jwtService: JwtService
    ) {}

    async register(user: RegisterAuthDto) {

        const { username } = user;
        const usernameExist = await this.usersRepository.findOneBy({ username: username })

        if (usernameExist) {
            // 409 CONFLICT
            throw new HttpException('El username ya esta registrado', HttpStatus.CONFLICT);
        }

        const newUser = this.usersRepository.create(user);
        let rolesIds = [];
        
        if (user.rolesIds !== undefined && user.rolesIds !== null) { // DATA
            rolesIds = user.rolesIds;
        }
        else {
            rolesIds.push('CLIENT')
        }
        
        const roles = await this.rolesRepository.findBy({ id: In(rolesIds) });
        newUser.roles = roles;

        const userSaved = await this.usersRepository.save(newUser);

        const rolesString = userSaved.roles.map(rol => rol.id); //['CLIENT', 'ADMIN']
        const payload = { id: userSaved.id, username: userSaved.username, roles: rolesString };
        const token = this.jwtService.sign(payload);
        const data = {
            username: userSaved,
            token: 'Bearer ' + token
        }
        delete data.username.password;
        return data;
    }

    async login(loginData: LoginAuthDto) {

        const { username, password } = loginData;
        const userFound = await this.usersRepository.findOne({ 
            where: { username: username },
            relations: ['roles']
         })
        if (!userFound) {
            throw new HttpException('El username no existe', HttpStatus.NOT_FOUND);
        }
        
        const isPasswordValid = await compare(password, userFound.password);
        if (!isPasswordValid) {
            console.log('PASSWORD INCORRECTO');
            
            // 403 FORBITTEN access denied
            throw new HttpException('La contraseña es incorrecta', HttpStatus.FORBIDDEN);
        }

        const rolesIds = userFound.roles.map(rol => rol.id); //['CLIENT', 'ADMIN']

        const payload = { 
            id: userFound.id, 
            namename: userFound.name, 
            roles: rolesIds 
        };
        const token = this.jwtService.sign(payload);
        const data = {
            username: userFound,
            token: 'Bearer ' + token
        }

        delete data.username.password;

        return data;
    }

}
