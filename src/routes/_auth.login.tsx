import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Input, InputGroup, InputTrailing, Label } from "#/components/jk/input";
import { Button } from "#/components/jk/button";
import { Card } from "#/components/jk/card";

export const Route = createFileRoute("/_auth/login")({
	component: Login,
});

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		if (!username || !password) {
			setError("Veuillez remplir tous les champs");
			return;
		}
		const res = await login(username, password);
		if (res.success) {
			navigate({ to: "/dashboard" });
		} else {
			setError(res.error ?? "Identifiants incorrects");
		}
	};

	return (
		<div className="w-full max-w-105">
			<Card size="none" fill="none" className="rounded-xl bg-white dark:bg-gray-800/40 ring ring-border-input/60 px-5 sm:px-10 lg:px-12 py-10 md:py-14">
				<div className="flex flex-col items-center text-center mb-8">
					<div className="bg-primary text-white size-14 rounded-ui d-flex-place-center">
						<Shield size={24} className="size-4" />
					</div>
					
					<p className="text-sm text-fg-muted mt-1">
						Direction Générale des Impôts
					</p>
					<p className="text-xs text-fg-muted mt-0.5">
						Système d'analyse de conformité des véhicules
					</p>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<Input
						label="Identifiant"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						autoFocus
						placeholder="username"
					/>
					<div className="space-y-1.5">
						<Label htmlFor="password">Mot de passe</Label>
						<InputGroup>
							<Input
								variant="unstyled"
								className="px-3"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								type={showPassword ? "text" : "password"}
							/>
							<InputTrailing absolute clickable>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg transition-colors"
								>
									{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</InputTrailing>
						</InputGroup>
					</div>

					{error && (
						<p className="text-xs text-danger bg-danger/5 px-3 py-2 rounded-ui">
							{error}
						</p>
					)}

					<Button
						type="submit"
						className="justify-center gap-2 mt-3"
					>
						<span className="iconify lucide--log-in" />
						Se connecter
					</Button>
				</form>
			</Card>
		</div>
	);
}
