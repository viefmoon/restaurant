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
        console.log('USER', user);
        const { username, roleId } = user;
        const usernameExist = await this.usersRepository.findOneBy({ username });
    
        if (usernameExist) {
            throw new HttpException('El username ya esta registrado', HttpStatus.CONFLICT);
        }
    
        const newUser = this.usersRepository.create(user);
        
        const role = await this.rolesRepository.findOneBy({ id: roleId });
        if (!role) {
            throw new HttpException('El rol no existe', HttpStatus.BAD_REQUEST);
        }
        newUser.roles = [role];
    
        const userSaved = await this.usersRepository.save(newUser);
    
        const payload = { id: userSaved.id, username: userSaved.username, roles: [role.id] };
        const token = this.jwtService.sign(payload);
        const data = {
            username: userSaved.username,
            token: 'Bearer ' + token
        };
        //delete data.username.password;
        return data;
    }

    async login(loginData: LoginAuthDto) {

        console.log('LOGIN DATA', loginData);
    
        const { username, password } = loginData;
        const userFound = await this.usersRepository.findOne({ 
            where: { username: username },
            select: ['id', 'username', 'name', 'password', 'created_at', 'updated_at'], 
            relations: ['roles']
        });

        if (!userFound) {
            throw new HttpException('El username no existe', HttpStatus.NOT_FOUND);
        }
        console.log('USER FOUND', userFound);
    
        const isPasswordValid = await compare(password, userFound.password);
        if (!isPasswordValid) {
            console.log('PASSWORD INCORRECTO');
            
            // 403 FORBIDDEN access denied
            throw new HttpException('La contraseña es incorrecta', HttpStatus.FORBIDDEN);
        }
    
        console.log('userFound.roles', userFound.roles);
        const rolesIds = userFound.roles.map(rol => rol.id); 
    
        console.log('ROLES IDS', rolesIds);
    
        const payload = { 
            id: userFound.id, 
            name: userFound.name, // Corregido de "namename" a "name"
            roles: rolesIds 
        };
        const token = this.jwtService.sign(payload);
        const data = {
            user: userFound,
            token: 'Bearer ' + token
        }
    
        delete data.user.password;
    
        return data;
    }

}
