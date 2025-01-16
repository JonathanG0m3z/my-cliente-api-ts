import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { decryptValue } from '../utils/cryptoHooks';
import { PersonalRequest } from '../interface/Request';

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

interface DecodedToken extends JwtPayload {
    id: string;
    email: string;
}

export const verifyToken = (req: PersonalRequest, _: Response, next: NextFunction): void => {
    const encryptedToken = req.headers.authorization;

    if (!encryptedToken) {
        throw new Error('No se proporcionó un token de autenticación');
    }

    const token = decryptValue(encryptedToken);

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET) as DecodedToken;
        const currentTimestamp = Math.floor(Date.now() / 1000);

        if (decodedToken.exp && decodedToken.exp < currentTimestamp) {
            throw new Error('Token de autenticación expirado');
        }

        // Verificar la firma del token
        jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

        // Guardar datos del usuario en la request
        req.userId = decodedToken.id;
        req.email = decodedToken.email;

        // Continuar con el siguiente middleware
        next();
    } catch (err: any) {
        throw new Error(err.message);
    }
};