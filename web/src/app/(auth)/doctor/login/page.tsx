import LoginForm from "@/components/doctor/LoginForm"
import Link from "next/link"

function DoctorLogin() {
	return (
		<div className="flex items-center justify-center h-screen">
			<div className="m-8 p-8 border rounded-lg shadow-md w-full max-w-[450px]">
				<h2 className="pb-4 text-xl font-semibold">Doctor Login</h2>
				<LoginForm />
				<div className="flex gap-1 mt-4">
					<p className="text-sm">Admin Login?</p>
					<Link href="/admin/login">
						<p className="text-blue-600 hover:underline text-sm">Click here</p>
					</Link>
				</div>
			</div>
		</div>
	)
}

export default DoctorLogin
