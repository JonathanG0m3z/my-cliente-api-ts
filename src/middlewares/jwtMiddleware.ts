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

export const verifyToken = (req: PersonalRequest, res: Response, next: NextFunction): void => {
    const encryptedToken = req.headers.authorization;

    if (!encryptedToken) {
        res.status(401).json({ message: 'No se proporcionó un token de autenticación' });
        return;
    }

    const token = decryptValue(encryptedToken);

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET) as DecodedToken;
        const currentTimestamp = Math.floor(Date.now() / 1000);

        if (decodedToken.exp && decodedToken.exp < currentTimestamp) {
            res.status(401).json({ message: 'Token de autenticación expirado' });
            return;
        }

        // Verificar la firma del token
        jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

        // Guardar datos del usuario en la request
        req.userId = decodedToken.id;
        req.email = decodedToken.email;

        // Continuar con el siguiente middleware
        next();
    } catch (err: any) {
        res.status(401).json({ message: err.message });
    }
};