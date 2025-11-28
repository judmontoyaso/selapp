import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email y contraseña son requeridos" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return NextResponse.json(
                { error: "Credenciales inválidas" },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Credenciales inválidas" },
                { status: 401 }
            );
        }

        // Create the token payload expected by NextAuth
        const token = await encode({
            token: {
                name: user.name,
                email: user.email,
                sub: user.id,
                id: user.id,
            },
            secret: process.env.NEXTAUTH_SECRET!,
        });

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        console.error("Mobile login error:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
