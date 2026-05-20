// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

export default defineConfig({
	base: '/it',
	integrations: [
		mermaid({ theme: 'neutral', autoTheme: true }),
		starlight({
			title: 'IT Knowledge Base',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/AlexBelik269/web-it' }],
			sidebar: [
				{
					label: 'Security',
					items: [
						{ label: 'Overview', slug: 'security' },
						{
							label: 'Web App Security',
							items: [
								{ label: 'OWASP Top 10', slug: 'security/web/owasp-top-10' },
								{ label: 'Cross-Site Scripting (XSS)', slug: 'security/web/xss' },
								{ label: 'SQL Injection', slug: 'security/web/sql-injection' },
								{ label: 'CSRF & Clickjacking', slug: 'security/web/csrf-clickjacking' },
								{ label: 'CORS & Same-Origin Policy', slug: 'security/web/cors-sop' },
							],
						},
						{
							label: 'Cryptography',
							items: [
								{ label: 'Fundamentals', slug: 'security/cryptography/fundamentals' },
								{ label: 'Symmetric Encryption', slug: 'security/cryptography/symmetric-encryption' },
								{ label: 'Asymmetric Encryption & Signatures', slug: 'security/cryptography/asymmetric-encryption' },
								{ label: 'Key Management', slug: 'security/cryptography/key-management' },
							],
						},
						{
							label: 'Infrastructure',
							items: [
								{ label: 'Secrets Management', slug: 'security/infrastructure/secrets-management' },
								{ label: 'Container Security', slug: 'security/infrastructure/container-security' },
								{ label: 'Cloud Security', slug: 'security/infrastructure/cloud-security' },
							],
						},
						{
							label: 'API Security',
							items: [
								{ label: 'API Security Fundamentals', slug: 'security/api/api-security-fundamentals' },
								{ label: 'Rate Limiting', slug: 'security/api/rate-limiting' },
								{ label: 'Input Validation', slug: 'security/api/input-validation' },
							],
						},
						{
							label: 'Compliance',
							items: [
								{ label: 'Security Frameworks', slug: 'security/compliance/security-frameworks' },
								{ label: 'GDPR for Engineers', slug: 'security/compliance/gdpr' },
							],
						},
						{
							label: 'Incident Response',
							items: [
								{ label: 'Logging & Monitoring', slug: 'security/incident-response/logging-monitoring' },
								{ label: 'Incident Playbooks', slug: 'security/incident-response/incident-playbooks' },
								{ label: 'Digital Forensics', slug: 'security/incident-response/forensics' },
							],
						},
					],
				},
				{
					label: 'Auth',
					items: [
						{ label: 'Overview', slug: 'auth' },
						{
							label: 'Fundamentals',
							items: [
								{ label: 'Core Concepts', slug: 'auth/fundamentals/overview' },
								{ label: 'AuthN vs AuthZ', slug: 'auth/fundamentals/authn-vs-authz' },
							],
						},
						{
							label: 'Credentials',
							items: [
								{ label: 'Authentication Factors & MFA', slug: 'auth/credentials/mfa-factors' },
								{ label: 'Passwords & Hashing', slug: 'auth/credentials/passwords-hashing' },
								{ label: 'Biometrics & Passkeys', slug: 'auth/credentials/biometrics-passkeys' },
								{ label: 'MFA Protocols Deep Dive', slug: 'auth/credentials/mfa-protocols' },
							],
						},
						{
							label: 'Tokens',
							items: [
								{ label: 'JWT', slug: 'auth/tokens/jwt' },
								{ label: 'Bearer Tokens', slug: 'auth/tokens/bearer-tokens' },
								{ label: 'API Keys', slug: 'auth/tokens/api-keys' },
								{ label: 'Token Storage', slug: 'auth/tokens/token-storage' },
							],
						},
						{
							label: 'Protocols',
							items: [
								{ label: 'OAuth 2.0', slug: 'auth/protocols/oauth2' },
								{ label: 'OpenID Connect (OIDC)', slug: 'auth/protocols/oidc' },
								{ label: 'SAML 2.0 & Enterprise SSO', slug: 'auth/protocols/saml-sso' },
								{ label: 'Certificates & PKI', slug: 'auth/protocols/certificates-pki' },
								{ label: 'Protocol Reference', slug: 'auth/protocols/protocol-reference' },
							],
						},
						{
							label: 'Authorization',
							items: [
								{ label: 'RBAC & ABAC', slug: 'auth/authorization/rbac-abac' },
								{ label: 'Permissions & Scopes', slug: 'auth/authorization/permissions-scopes' },
								{ label: 'Zero Trust Architecture', slug: 'auth/authorization/zero-trust' },
							],
						},
						{
							label: 'Implementation',
							items: [
								{ label: 'Auth in Code', slug: 'auth/implementation/auth-in-code' },
								{ label: 'Sessions & Cookies', slug: 'auth/implementation/sessions-cookies' },
								{ label: 'HTTP Security Headers', slug: 'auth/implementation/http-security-headers' },
							],
						},
						{
							label: 'Security',
							items: [
								{ label: 'Threats & Attacks', slug: 'auth/security/threats-attacks' },
								{ label: 'Best Practices', slug: 'auth/security/best-practices' },
								{ label: 'Security Checklist', slug: 'auth/security/security-checklist' },
							],
						},
					],
				},
			],
		}),
	],
});
