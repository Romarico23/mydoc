// // types/next-auth.d.ts

// import { User as NextAuthUser } from "next-auth"
// import { JWT } from "next-auth/jwt"

// declare module "next-auth" {
// 	interface User {
// 		token?: string // Add custom properties to User
// 		email?: string
// 	}

// 	interface Session {
// 		user: {
// 			email?: string
// 			accessToken?: string
// 		}
// 	}

// 	interface JWT {
// 		accessToken?: string
// 		email?: string
// 	}
// }

import { User as NextAuthUser } from "next-auth"
import { JWT as NextAuthJWT } from "next-auth/jwt"

declare module "next-auth" {
	interface User {
		// aToken?: string // Add custom properties to User
		// email?: string
		aToken?: string // Add custom properties to User
		dToken?: string
		role?: string
		email?: string
	}

	interface Session {
		user: {
			// email?: string
			// accessToken?: string
			// aToken?: string
			aToken?: string // Add custom properties to User
			dToken?: string
			role?: string
			email?: string
		}
	}

	// interface JWT extends NextAuthJWT {
	// 	accessToken?: string
	// 	// aToken?: string
	// 	email?: string
	// 	// exp?: number // Add `exp` (expiration) to JWT interface
	// }
}
