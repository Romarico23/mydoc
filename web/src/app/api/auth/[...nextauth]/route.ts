// // import NextAuth, { NextAuthOptions, Session, User, JWT } from "next-auth"
// import NextAuth, { NextAuthOptions, Session, User } from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"
// import axios from "@/lib/services/axios"

// const handler = NextAuth({
// 	providers: [
// 		CredentialsProvider({
// 			name: "Credentials",
// 			credentials: {
// 				email: { label: "Email", type: "text" },
// 				password: { label: "Password", type: "password" },
// 			},
// 			async authorize(credentials) {
// 				try {
// 					const response = await axios.post("/api/admin/login", {
// 						email: credentials?.email,
// 						password: credentials?.password,
// 					})

// 					const user = response.data

// 					// If no error and we have user data, return it
// 					if (response.status === 200 && user) {
// 						return user // Return user without ID
// 					} else {
// 						return null
// 					}
// 				} catch (error) {
// 					console.error("Login error:", error)
// 					return null
// 				}
// 			},
// 		}),
// 	],
// 	pages: {
// 		signIn: "/admin/login", // Custom sign-in page
// 	},
// 	session: {
// 		strategy: "jwt",
// 		maxAge: 60 * 60 * 8, // 8 hours, user logs in once a day
// 		updateAge: 60 * 30, // Session is refreshed every 30 minutes of activity
// 	},
// 	callbacks: {
// 		async jwt({ token, user }) {
// 			if (user) {
// 				// token.accessToken = user.token as string
// 				token.aToken = user.aToken as string
// 				token.email = user.email as string
// 			}
// 			return token
// 		},

// 		async session({ session, token }) {
// 			// session.user.accessToken = token.accessToken as string
// 			session.user.aToken = token.aToken as string
// 			session.user.email = token.email as string
// 			return session
// 		},
// 	},
// } as NextAuthOptions)

// export { handler as GET, handler as POST }

import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "@/lib/services/axios"

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
				role: { label: "Role", type: "text" }, // Added role field (admin or doctor)
			},
			async authorize(credentials) {
				try {
					let response

					// Determine login route based on role
					if (credentials?.role === "admin") {
						response = await axios.post("/api/admin/login", {
							email: credentials.email,
							password: credentials.password,
						})
					} else if (credentials?.role === "doctor") {
						response = await axios.post("/api/doctor/login", {
							email: credentials.email,
							password: credentials.password,
						})
					} else {
						throw new Error("Invalid role specified")
					}

					const user = response.data

					// If successful, return user data
					if (response.status === 200 && user) {
						return { ...user, role: credentials.role } // Include role in session
					} else {
						return null
					}
				} catch (error) {
					console.error("Login error:", error)
					return null
				}
			},
		}),
	],
	pages: {
		signIn: "/login", // Unified sign-in page
	},
	session: {
		strategy: "jwt",
		maxAge: 60 * 60 * 8, // 8 hours session
		updateAge: 60 * 30, // Refresh session every 30 minutes
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				// Store tokens based on role
				if (user.role === "admin") {
					token.aToken = user.aToken as string
				} else if (user.role === "doctor") {
					token.dToken = user.dToken as string
				}
				token.email = user.email as string
				token.role = user.role as string
			}
			return token
		},

		async session({ session, token }) {
			// Pass token to session
			if (token.role === "admin") {
				session.user.aToken = token.aToken as string
			} else if (token.role === "doctor") {
				session.user.dToken = token.dToken as string
			}
			session.user.email = token.email as string
			session.user.role = token.role as string
			return session
		},
	},
} as NextAuthOptions)

export { handler as GET, handler as POST }
