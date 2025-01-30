"use server"

import { signIn } from "next-auth/react"
import { redirect } from "next/navigation";

export async function IN() {
    signIn("discord");
    redirect('/');
}