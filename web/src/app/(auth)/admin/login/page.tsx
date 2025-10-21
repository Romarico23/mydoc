import LoginForm from "@/components/admin/LoginForm"
import Link from "next/link"

export default function AdminLogin() {
	return (
		<div className="flex items-center justify-center h-screen">
			<div className="m-8 p-8 border rounded-lg shadow-md w-full max-w-[450px]">
				<h2 className="pb-4 text-xl font-semibold">Admin Login</h2>
				<LoginForm />
				<div className="flex gap-1 mt-4">
					<p className="text-sm">Doctor Login?</p>
					<Link href="/doctor/login">
						<p className="text-blue-600 hover:underline text-sm">Click here</p>
					</Link>
				</div>
			</div>
		</div>
	)
}
