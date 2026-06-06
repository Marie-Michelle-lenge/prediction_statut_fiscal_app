import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

export function cx(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
export const focusRing = tv({
	base: "outline outline-primary forced-colors:outline-[Highlight] outline-offset-2",
	variants: {
		isFocusVisible: {
			false: "outline-0",
			true: "outline-2",
		},
	},
});

export function formatNumber(n: number): string {
	return new Intl.NumberFormat("fr-FR").format(n);
}

export function formatPercent(n: number): string {
	return `${n.toFixed(1)}%`;
}

export function formatCurrency(n: number): string {
	return new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(n);
}

export function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString("fr-FR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

export function formatDateTime(iso: string): string {
	return new Date(iso).toLocaleDateString("fr-FR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function getStatusColor(status: string): string {
	switch (status) {
		case "conforme":
			return "hsl(var(--success))";
		case "non_conforme":
			return "hsl(var(--danger))";
		case "a_risque":
			return "hsl(var(--warning))";
		default:
			return "var(--fg-muted)";
	}
}

export function getStatusLabel(status: string): string {
	switch (status) {
		case "conforme":
			return "Conforme";
		case "non_conforme":
			return "Non conforme";
		case "a_risque":
			return "À risque";
		default:
			return status;
	}
}

export function getRiskColor(risk: string): string {
	switch (risk) {
		case "faible":
			return "hsl(var(--success))";
		case "moyen":
			return "hsl(var(--warning))";
		case "eleve":
			return "hsl(var(--danger))";
		case "critique":
			return "var(--color-danger-700)";
		default:
			return "var(--fg-muted)";
	}
}

export function getRiskLabel(risk: string): string {
	switch (risk) {
		case "faible":
			return "Faible";
		case "moyen":
			return "Moyen";
		case "eleve":
			return "Élevé";
		case "critique":
			return "Critique";
		default:
			return risk;
	}
}

export function getDocStatusColor(status: string): string {
	return status === "valide" ? "hsl(var(--success))" : "hsl(var(--danger))";
}

export function getDocStatusLabel(status: string): string {
	return status === "valide" ? "Valide" : "Expiré";
}
