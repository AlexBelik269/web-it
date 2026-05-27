// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';

import react from '@astrojs/react';

export default defineConfig({
    markdown: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
    },
    base: '/it',
    site: 'https://alex-belik.cz',
    integrations: [mermaid({ theme: 'neutral', autoTheme: true }), [expressiveCode()], [mdx()], starlight({
        title: 'IT Knowledge Base',
        social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/AlexBelik269/web-it' }],
        customCss: ['katex/dist/katex.min.css', './src/styles/custom.css'],
        components: {
            Sidebar: './src/components/Sidebar.astro',
        },
        sidebar: [
            {
                label: 'Overview',
                collapsed: true,
                items: [
                    { label: 'Knowledge Base Overview', slug: 'overview' },
                ],
            },
            {
            /*
            ---------------------------------------------------------- SECURITY ----------------------------------------------------------
             - Chapters: Principals, Web App Security, Malware, Cryptography, Infrastructure, Compliance, Incident Response, INTROL, ISF
            ------------------------------------------------------------------------------------------------------------------------------
            */
                label: 'Security',
                collapsed: true,
                items: [
                    { label: 'Overview', slug: 'security' },
                    {
                    label: 'Principals',
                        collapsed: true,
                        items: [
                            { label: 'Cyber Warfare', slug: 'security/principals/cyber-warfare' },
                            { label: 'Email Security', slug: 'security/principals/email-security' },
                            { label: 'Password Security', slug: 'security/principals/password-security' },
                            { label: 'Endpoint Protection', slug: 'security/principals/endpoint-protection' },
                        ],
                    },
                    {
                    label: 'Web App Security',
                        collapsed: true,
                        items: [
                            { label: 'OWASP Top 10', slug: 'security/web/owasp-top-10' },
                            { label: 'Cross-Site Scripting (XSS)', slug: 'security/web/xss' },
                            { label: 'SQL Injection', slug: 'security/web/sql-injection' },
                            { label: 'CSRF & Clickjacking', slug: 'security/web/csrf-clickjacking' },
                            { label: 'CORS & Same-Origin Policy', slug: 'security/web/cors-sop' },
                            { label: 'HTTP Security Headers', slug: 'security/web/http-security-headers' }
                        ],
                    },
                    {
                        label: 'Malware',
                        collapsed: true,
                        items: [
                            { label: 'Malware', slug: 'security/malware' },
                            { label: 'Malware Types', slug: 'security/malware/malware-types' },
                            { label: 'Attack Techniques', slug: 'security/malware/attack-techniques' },
                            { label: 'Detection & Defense', slug: 'security/malware/detection-and-defense' },
                        ],
                    },
                    
                    {
                        label: 'Cryptography',
                        collapsed: true,
                        items: [
                            { label: 'Fundamentals', slug: 'security/cryptography/fundamentals' },
                            { label: 'Hashing & Salting', slug: 'security/cryptography/hashing-and-salting' },
                            { label: 'Symmetric Encryption', slug: 'security/cryptography/symmetric-encryption' },
                            { label: 'Asymmetric Encryption & Signatures', slug: 'security/cryptography/asymmetric-encryption' },
                            { label: 'Key Management', slug: 'security/cryptography/key-management' },
                            { label: 'Quantum Technologies', slug: 'security/cryptography/quantum_technologies' },

                            {
                                label: 'Encoding',
                                collapsed: true,
                                items: [
                                    { label: 'Encoding Overview', slug: 'security/cryptography/encoding' },
                                    { label: 'Binary & ASCII', slug: 'security/cryptography/encoding/binary-and-ascii' },
                                    { label: 'Morse Code', slug: 'security/cryptography/encoding/morse-code' },
                                    { label: 'Steganography', slug: 'security/cryptography/encoding/steganography' },
                                ],
                            },
                            {
                                label: 'Classical Ciphers',
                                collapsed: true,
                                items: [
                                    { label: 'History & Overview', slug: 'security/cryptography/classical-ciphers' },
                                    { label: 'Caesar Cipher', slug: 'security/cryptography/classical-ciphers/caesar-cipher' },
                                    { label: 'Substitution Ciphers', slug: 'security/cryptography/classical-ciphers/substitution-ciphers' },
                                    { label: 'Vigenère Cipher', slug: 'security/cryptography/classical-ciphers/vigenere-cipher' },
                                    { label: 'Enigma Machine', slug: 'security/cryptography/classical-ciphers/enigma' },
                                ],
                            },
                        ],
                    },
                    {
                        label: 'Infrastructure',
                        collapsed: true,
                        items: [
                            { label: 'Secrets Management', slug: 'security/infrastructure/secrets-management' },
                            { label: 'Container Security', slug: 'security/infrastructure/container-security' },
                            { label: 'Cloud Security', slug: 'security/infrastructure/cloud-security' },
                        ],
                    },
                    {
                        label: 'Compliance',
                        collapsed: true,
                        items: [
                            { label: 'Overview', slug: 'security/compliance' },
                            { label: 'Ethics & Security Law', slug: 'security/compliance/ethics-and-law' },
                            { label: 'Security Frameworks', slug: 'security/compliance/security-frameworks' },
                            { label: 'GDPR for Engineers', slug: 'security/compliance/gdpr' },
                        ],
                    },
                    {
                        label: 'Incident Response',
                        collapsed: true,
                        items: [
                            { label: 'Logging & Monitoring', slug: 'security/incident-response/logging-monitoring' },
                            { label: 'Incident Playbooks', slug: 'security/incident-response/incident-playbooks' },
                            { label: 'Digital Forensics', slug: 'security/incident-response/forensics' },
                        ],
                    },
                    {
                        label: 'INTROL',
                        collapsed: true,
                        items: [
                            { label: '1. Einführung', slug: 'security/introl/sw01_einfuehrung' },
                            { label: '2. Open Your Mind', slug: 'security/introl/sw02_open_your_mind' },
                            { label: '3. Cracking Lab', slug: 'security/introl/sw03_cracking_lab' },
                            { label: '4. Netzwerk-Analyse mit Wireshark', slug: 'security/introl/sw04_netzwerk_analyse_wireshark' },
                            { label: '5. Protokollanalyse', slug: 'security/introl/sw05_protokollanalyse' },
                            { label: '6. Man in the Middle', slug: 'security/introl/sw06_man_in_the_middle' },
                            { label: '7. Physische Sicherheit', slug: 'security/introl/sw07_physische_sicherheit_schloesser_schluessel' },
                            { label: '8. Firewall Basics I', slug: 'security/introl/sw08_firewall_grundlagen' },
                            { label: '9. Firewall Basics II', slug: 'security/introl/sw09_firewall_basics' },
                            { label: '10. Firewall Advanced', slug: 'security/introl/sw10_firewall_advanced' },
                            { label: '11. IPv6 Grundlagen', slug: 'security/introl/sw11_ipv6_grundlagen' },
                            { label: '12. IPv6 Adressierung, Routing und Tunneling', slug: 'security/introl/sw12_ipv6_adressierung_routing' },
                        ],
                    },
                    {
                        label: 'ISF',
                        collapsed: true,
                        items: [
                            { label: '1. Grundlagen', slug: 'security/isf/sw01_begriffe_commonground' },
                            { label: '2. Awareness', slug: 'security/isf/sw02_awareness' },
                            { label: '3. Intercepten', slug: 'security/isf/sw03_intercepten' },
                            { label: '4. Intro Kryptographie', slug: 'security/isf/sw04_intro_kryptographie' },
                            { label: '5. Grundlagen der Kryptologie', slug: 'security/isf/sw05_grundlagen_kryptologie' },
                            { label: '6. Asymmetrische Kryptologie', slug: 'security/isf/sw06_asymmetrische_kryptologie' },
                            { label: '7. Protokolle', slug: 'security/isf/sw07_protokolle' },
                            { label: '8. ISMS & Standards', slug: 'security/isf/sw08_isms_standards' },
                            { label: '9. Risiko Management', slug: 'security/isf/sw09_risiko_management' },
                            { label: '10. Zugangskontrolle', slug: 'security/isf/sw10_zugangskontrolle' },
                            { label: '11. Vulnerabilities', slug: 'security/isf/sw11_vulnerabilities' },
                        ],
                    },
                ],
            },
            /*
            ------------------------------------------- NETWORKING -------------------------------------------
             - Chapters: Fundamentals, Addressing, Protocols, Traffic & Switching, Wireless, Security, NETW1
            --------------------------------------------------------------------------------------------------
            */
            {
                label: 'Networking',
                collapsed: true,
                items: [
                    { label: 'Overview', slug: 'network' },
                    {
                        label: 'Fundamentals',
                        collapsed: true,
                        items: [
                            { label: 'OSI & TCP/IP Model', slug: 'network/fundamentals/osi-model' },
                            { label: 'Network Devices', slug: 'network/fundamentals/network-devices' },
                            { label: 'Cables & Physical Media', slug: 'network/fundamentals/cables-media' },
                        ],
                    },
                    {
                        label: 'Addressing',
                        collapsed: true,
                        items: [
                            { label: 'IP Addressing & Subnetting', slug: 'network/addressing/ip-addressing' },
                            { label: 'DNS', slug: 'network/addressing/dns' },
                            { label: 'DHCP', slug: 'network/addressing/dhcp' },
                        ],
                    },
                    {
                        label: 'Protocols',
                        collapsed: true,
                        items: [
                            { label: 'TCP & UDP', slug: 'network/protocols/tcp-udp' },
                            { label: 'HTTP & HTTPS', slug: 'network/protocols/http-https' },
                            { label: 'Routing Protocols', slug: 'network/protocols/routing-protocols' },
                            { label: 'Protocol Reference', slug: 'network/protocols/protocol-reference' },
                        ],
                    },
                    {
                        label: 'Traffic & Switching',
                        collapsed: true,
                        items: [
                            { label: 'Traffic Analysis', slug: 'network/traffic/traffic-analysis' },
                            { label: 'VLANs & Switching', slug: 'network/traffic/switching' },
                        ],
                    },
                    {
                        label: 'Wireless',
                        collapsed: true,
                        items: [
                            { label: 'Wi-Fi (802.11)', slug: 'network/wireless/wifi' },
                        ],
                    },
                    {
                        label: 'Security',
                        collapsed: true,
                        items: [
                            { label: 'Firewalls & IDS/IPS', slug: 'network/security/network-security' },
                            { label: 'Attacks & Defenses', slug: 'network/security/attacks-defenses' },
                            { label: 'VPN & Tunneling', slug: 'network/security/vpn-tunneling' },
                            { label: 'Zero Trust Networking', slug: 'network/security/zero-trust-network' },
                        ],
                    },
                    {
                        label: 'NETW1',
                        collapsed: true,
                        items: [
                            { label: '1. Networking Today', slug: 'network/netw1/01_networking_today' },
                            { label: '2. Grundkonfiguration & Zahlensysteme', slug: 'network/netw1/02_grundkonfiguration_und_zahlensysteme' },
                            { label: '3. Protokolle und Modelle', slug: 'network/netw1/03_protokolle_und_modelle' },
                            { label: '4. Physical & Data Link Layer', slug: 'network/netw1/04_physical_data_link_layer' },
                            { label: '5. Ethernet Switching', slug: 'network/netw1/05_ethernet_switching' },
                            { label: '6. Network Layer', slug: 'network/netw1/06_network_layer' },
                            { label: '7. Adressauflösung & Router-Konfiguration', slug: 'network/netw1/07_adressaufloesung_router_konfiguration' },
                            { label: '8. IPv4 Adressierung', slug: 'network/netw1/08_ipv4_adressierung' },
                            { label: '9. IPv6 Grundlagen', slug: 'network/netw1/09_ipv6_grundlagen' },
                            { label: '10. Subnetting & IP-Adressen', slug: 'network/netw1/10_subnetting_und_ip_adressen' },
                            { label: '11. ICMP & Transportschicht', slug: 'network/netw1/11_icmp_und_transportschicht' },
                            { label: '12. Applikationsschicht & Netzwerksicherheit', slug: 'network/netw1/12_applikationsschicht_und_netzwerksicherheit' },
                            { label: '13. Aufbau eines kleinen Netzwerks', slug: 'network/netw1/13_build_a_small_network' },
                        ],
                    },
                ],
            },

            {
                label: 'AI & LLMs',
                collapsed: true,
                items: [
                    { label: 'Overview', slug: 'ai' },
                    {
                        label: 'Fundamentals',
                        collapsed: true,
                        items: [
                            { label: 'What is AI?', slug: 'ai/fundamentals/what-is-ai' },
                            { label: 'Machine Learning Basics', slug: 'ai/fundamentals/machine-learning-basics' },
                            { label: 'AI and Machine Learning Basics', slug: 'ai/fundamentals/ai-and-ml-basics' },
                            { label: 'Neural Networks', slug: 'ai/fundamentals/neural-networks' },
                        ],
                    },
                    {
                        label: 'Large Language Models',
                        collapsed: true,
                        items: [
                            { label: 'How LLMs Work', slug: 'ai/llm/how-llms-work' },
                            { label: 'Tokens & Context Windows', slug: 'ai/llm/tokens-and-context' },
                            { label: 'Prompt Engineering', slug: 'ai/llm/prompting' },
                        ],
                    },
                    {
                        label: 'Concepts',
                        collapsed: true,
                        items: [
                            { label: 'Training vs Inference', slug: 'ai/concepts/training-vs-inference' },
                            { label: 'AI Safety & Ethics', slug: 'ai/concepts/ai-safety-ethics' },
                        ],
                    },
                    {
                        label: 'Tools & APIs',
                        collapsed: true,
                        items: [
                            { label: 'AI Tools Overview', slug: 'ai/tools/ai-tools-overview' },
                            { label: 'Using AI APIs', slug: 'ai/tools/using-apis' },
                        ],
                    },
                ],
            },
            {
                label: 'Auth',
                collapsed: true,
                items: [
                    { label: 'Overview', slug: 'auth' },
                    {
                        label: 'Fundamentals',
                        collapsed: true,
                        items: [
                            { label: 'Core Concepts', slug: 'auth/fundamentals/overview' },
                            { label: 'AuthN vs AuthZ', slug: 'auth/fundamentals/authn-vs-authz' },
                        ],
                    },
                    {
                        label: 'Credentials',
                        collapsed: true,
                        items: [
                            { label: 'Authentication Factors & MFA', slug: 'auth/credentials/mfa-factors' },
                            { label: 'Passwords & Hashing', slug: 'auth/credentials/passwords-hashing' },
                            { label: 'Biometrics & Passkeys', slug: 'auth/credentials/biometrics-passkeys' },
                            { label: 'MFA Protocols Deep Dive', slug: 'auth/credentials/mfa-protocols' },
                        ],
                    },
                    {
                        label: 'Tokens',
                        collapsed: true,
                        items: [
                            { label: 'JWT', slug: 'auth/tokens/jwt' },
                            { label: 'Bearer Tokens', slug: 'auth/tokens/bearer-tokens' },
                            { label: 'API Keys', slug: 'auth/tokens/api-keys' },
                            { label: 'Token Storage', slug: 'auth/tokens/token-storage' },
                        ],
                    },
                    {
                        label: 'Protocols',
                        collapsed: true,
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
                        collapsed: true,
                        items: [
                            { label: 'RBAC & ABAC', slug: 'auth/authorization/rbac-abac' },
                            { label: 'Permissions & Scopes', slug: 'auth/authorization/permissions-scopes' },
                            { label: 'Zero Trust Architecture', slug: 'auth/authorization/zero-trust' },
                        ],
                    },
                    {
                        label: 'Implementation',
                        collapsed: true,
                        items: [
                            { label: 'Auth in Code', slug: 'auth/implementation/auth-in-code' },
                            { label: 'Sessions & Cookies', slug: 'auth/implementation/sessions-cookies' },
                            { label: 'HTTP Security Headers', slug: 'auth/implementation/http-security-headers' },
                        ],
                    },
                    {
                        label: 'Security',
                        collapsed: true,
                        items: [
                            { label: 'Threats & Attacks', slug: 'auth/security/threats-attacks' },
                            { label: 'Best Practices', slug: 'auth/security/best-practices' },
                            { label: 'Security Checklist', slug: 'auth/security/security-checklist' },
                        ],
                    },
                ],
            },
            {
                label: 'Cloud & Containers',
                collapsed: true,
                items: [
                    { label: 'Overview', slug: 'cloud' },
                    {
                        label: 'Cloud Fundamentals',
                        collapsed: true,
                        items: [
                            { label: 'Cloud Concepts', slug: 'cloud/fundamentals/cloud-concepts' },
                            { label: 'Virtualization & Containers', slug: 'cloud/fundamentals/virtualization' },
                        ],
                    },
                    {
                        label: 'Containers',
                        collapsed: true,
                        items: [
                            { label: 'Docker', slug: 'cloud/containers/docker' },
                            { label: 'Docker Compose', slug: 'cloud/containers/docker-compose' },
                            { label: 'Container Registries', slug: 'cloud/containers/container-registry' },
                        ],
                    },
                    {
                        label: 'Orchestration',
                        collapsed: true,
                        items: [
                            { label: 'Kubernetes', slug: 'cloud/orchestration/kubernetes' },
                            { label: 'Kubernetes Advanced', slug: 'cloud/orchestration/kubernetes-advanced' },
                            { label: 'Helm', slug: 'cloud/orchestration/helm' },
                            { label: 'OpenShift', slug: 'cloud/orchestration/openshift' },
                        ],
                    },
                    {
                        label: 'Infrastructure as Code',
                        collapsed: true,
                        items: [
                            { label: 'Ansible', slug: 'cloud/iac/ansible' },
                            { label: 'Terraform', slug: 'cloud/iac/terraform' },
                        ],
                    },
                    {
                        label: 'Security',
                        collapsed: true,
                        items: [
                            { label: 'Cloud Security', slug: 'cloud/security/cloud-security' },
                            { label: 'Container Security', slug: 'cloud/security/container-security' },
                        ],
                    },
                    {
                        label: 'Docker & Kubernetes Workshop',
                        collapsed: true,
                        items: [
                            { label: 'Cloud Overview', slug: 'cloud/docker-kubernetes/cloud' },
                            { label: 'Docker', slug: 'cloud/docker-kubernetes/docker' },
                            { label: 'Docker Basics', slug: 'cloud/docker-kubernetes/docker-basics' },
                            { label: 'Docker Commands', slug: 'cloud/docker-kubernetes/docker-commands' },
                            { label: 'Docker Practice', slug: 'cloud/docker-kubernetes/docker-practice' },
                            { label: 'Kubernetes', slug: 'cloud/docker-kubernetes/kubernetes' },
                            { label: 'Kubernetes Commands', slug: 'cloud/docker-kubernetes/kubernetes-commands' },
                            { label: 'Kubernetes Workshop', slug: 'cloud/docker-kubernetes/kubernetes-workshop' },
                        ],
                    },
                ],
            },
            {
                label: 'Databases',
                collapsed: true,
                items: [
                    { label: 'Overview', slug: 'databases' },
                    {
                        label: 'Relational',
                        collapsed: true,
                        items: [
                            { label: 'Relational Databases', slug: 'databases/relational/relational-databases' },
                        ],
                    },
                    {
                        label: 'NoSQL',
                        collapsed: true,
                        items: [
                            { label: 'NoSQL & CAP Theorem', slug: 'databases/nosql/nosql' },
                        ],
                    },
                    {
                        label: 'SQL',
                        collapsed: true,
                        items: [
                            { label: 'SQL Fundamentals', slug: 'databases/sql/sql-fundamentals' },
                        ],
                    },
                    {
                        label: 'Internals',
                        collapsed: true,
                        items: [
                            { label: 'Transactions', slug: 'databases/internals/transactions' },
                            { label: 'Indexing', slug: 'databases/internals/indexing' },
                        ],
                    },
                    {
                        label: 'Operations',
                        collapsed: true,
                        items: [
                            { label: 'Replication', slug: 'databases/operations/replication' },
                            { label: 'Backup & Recovery', slug: 'databases/operations/backup-recovery' },
                            { label: 'Performance Tuning', slug: 'databases/operations/performance-tuning' },
                            { label: 'Security', slug: 'databases/operations/security' },
                        ],
                    },
                ],
            },
            {
                label: 'Mathematics',
                collapsed: true,
                items: [
                    { label: 'Overview', slug: 'math' },
                    {
                        label: 'Foundations',
                        collapsed: true,
                        items: [
                            { label: 'Number Sets', slug: 'math/foundations/number-sets' },
                            { label: 'Algebra Basics', slug: 'math/foundations/algebra' },
                        ],
                    },
                    {
                        label: 'Data Types',
                        collapsed: true,
                        items: [
                            { label: 'Boolean & Logic', slug: 'math/data-types/boolean' },
                            { label: 'Integers & Binary', slug: 'math/data-types/integers' },
                            { label: 'Floats & IEEE 754', slug: 'math/data-types/floats' },
                            { label: 'Sets & Functions', slug: 'math/data-types/sets-functions' },
                        ],
                    },
                    {
                        label: 'Logic',
                        collapsed: true,
                        items: [
                            { label: 'Propositional Logic', slug: 'math/logic/propositional-logic' },
                            { label: 'Predicate Logic', slug: 'math/logic/predicate-logic' },
                            { label: 'Proof Methods', slug: 'math/logic/proof-methods' },
                        ],
                    },
                    {
                        label: 'Algorithm Analysis',
                        collapsed: true,
                        items: [
                            { label: 'Complexity & Big O', slug: 'math/algorithms/complexity' },
                            { label: 'Recursive Algorithms', slug: 'math/algorithms/recursion' },
                            { label: 'Mathematical Induction', slug: 'math/algorithms/induction' },
                        ],
                    },
                    {
                        label: 'Combinatorics',
                        collapsed: true,
                        items: [
                            { label: 'Counting Rules', slug: 'math/combinatorics/counting-rules' },
                            { label: 'Permutations & Combinations', slug: 'math/combinatorics/permutations-combinations' },
                        ],
                    },
                    {
                        label: 'Relations',
                        collapsed: true,
                        items: [
                            { label: 'Relations & Properties', slug: 'math/relations/relations' },
                        ],
                    },
                    {
                        label: 'Graph Theory',
                        collapsed: true,
                        items: [
                            { label: 'Graph Basics', slug: 'math/graphs/graph-basics' },
                            { label: 'Special Graphs', slug: 'math/graphs/special-graphs' },
                            { label: 'Trees', slug: 'math/graphs/trees' },
                        ],
                    },
                ],
            },
            {
                label: 'Operating Systems',
                collapsed: true,
                items: [
                    { label: 'Overview', slug: 'os' },
                    {
                        label: 'Linux',
                        collapsed: true,
                        items: [
                            { label: 'Linux Fundamentals', slug: 'os/linux/linux-fundamentals' },
                        ],
                    },
                    {
                        label: 'Windows',
                        collapsed: true,
                        items: [
                            { label: 'Windows Fundamentals', slug: 'os/windows/windows-fundamentals' },
                        ],
                    },
                    {
                        label: 'Internals',
                        collapsed: true,
                        items: [
                            { label: 'Processes & Threads', slug: 'os/processes/processes-threads' },
                            { label: 'Memory Management', slug: 'os/memory/memory-management' },
                            { label: 'File Systems', slug: 'os/filesystems/file-systems' },
                        ],
                    },
                    {
                        label: 'Management',
                        collapsed: true,
                        items: [
                            { label: 'Services & Daemons', slug: 'os/services/services-daemons' },
                            { label: 'Permissions & Access Control', slug: 'os/permissions/permissions-access-control' },
                        ],
                    },
                    {
                        label: 'Shell & Scripting',
                        collapsed: true,
                        items: [
                            { label: 'Bash', slug: 'os/shell/bash' },
                            { label: 'PowerShell', slug: 'os/shell/powershell' },
                        ],
                    },
                    {
                        label: 'Operations',
                        collapsed: true,
                        items: [
                            { label: 'System Monitoring', slug: 'os/monitoring/system-monitoring' },
                            { label: 'Troubleshooting', slug: 'os/troubleshooting/troubleshooting' },
                        ],
                    },
                ],
            },
            {
                label: 'Programming',
                collapsed: true,
                items: [
                    { label: 'Overview', slug: 'programming' },
                    { label: 'Fundamentals', slug: 'programming/fundamentals' },
                    { label: 'Data Structures', slug: 'programming/data-structures' },
                    { label: 'Algorithms', slug: 'programming/algorithms' },
                    { label: 'Object-Oriented Programming', slug: 'programming/oop' },
                    { label: 'Functional Programming', slug: 'programming/functional' },
                    { label: 'Design Patterns', slug: 'programming/design-patterns' },
                    { label: 'Testing', slug: 'programming/testing' },
                    { label: 'Error Handling', slug: 'programming/error-handling' },
                    { label: 'Secure Coding', slug: 'programming/secure-coding' },
                    {
                        label: 'Languages',
                        collapsed: true,
                        items: [
                            {
                                label: 'C#',
                                collapsed: true,
                                items: [
                                    { label: 'Overview', slug: 'programming/languages/csharp/csharp' },
                                    { label: 'Basics', slug: 'programming/languages/csharp/csharp-basics' },
                                    { label: 'ADO.NET', slug: 'programming/languages/csharp/ado-net' },
                                    { label: 'ASP.NET Core', slug: 'programming/languages/csharp/asp-net-core' },
                                    { label: 'Design Patterns', slug: 'programming/languages/csharp/dotnet-dp' },
                                    { label: 'Data Structures', slug: 'programming/languages/csharp/dotnet-ds' },
                                    { label: 'FAQ', slug: 'programming/languages/csharp/dotnet-faq' },
                                    { label: 'Multiple Choice Q&A', slug: 'programming/languages/csharp/dotnet-mcq' },
                                    { label: '.NET Programming', slug: 'programming/languages/csharp/dotnet-programming' },
                                    { label: 'Unit Testing', slug: 'programming/languages/csharp/dotnet-unit-test' },
                                ],
                            },
                            {
                                label: 'Java',
                                collapsed: true,
                                items: [
                                    { label: 'Overview', slug: 'programming/languages/java/java' },
                                    { label: 'Collections Questions', slug: 'programming/languages/java/collections-questions' },
                                    { label: 'Multiple Choice Q&A', slug: 'programming/languages/java/java-multiple-choice-questions-answers' },
                                    { label: 'Java Programs', slug: 'programming/languages/java/java-programs' },
                                    { label: 'String Methods', slug: 'programming/languages/java/java-string-methods' },
                                    { label: 'JSP Questions', slug: 'programming/languages/java/jsp-questions' },
                                    { label: 'Multithreading Questions', slug: 'programming/languages/java/multithreading-questions' },
                                    { label: 'Servlets Questions', slug: 'programming/languages/java/servlets-questions' },
                                ],
                            },
                            {
                                label: 'Python',
                                collapsed: true,
                                items: [
                                    { label: 'Overview', slug: 'programming/languages/python/python' },
                                    { label: 'Python Basics', slug: 'programming/languages/python/python-basics' },
                                    { label: 'Python Programs', slug: 'programming/languages/python/python-programs' },
                                ],
                            },
                            { label: 'JavaScript & TypeScript', slug: 'programming/languages/javascript-typescript' },
                            { label: 'HTML & CSS', slug: 'programming/languages/html-css' },
                            { label: 'Comparison: C# vs Java vs Python', slug: 'programming/languages/comparison-oop' },
                            { label: 'Comparison: JS / TS / HTML / CSS', slug: 'programming/languages/comparison-web' },
                        ],
                    },
                ],
            },
            {
                label: 'Web',
                collapsed: true,
                items: [
                    { label: 'Overview', slug: 'web' },
                    {
                        label: 'Architecture',
                        collapsed: true,
                        items: [
                            { label: 'Microservices', slug: 'web/architecture/microservices' },
                            { label: 'Monoliths', slug: 'web/architecture/monoliths' },
                            { label: 'Overview', slug: 'web/architecture/overview' },
                            { label: 'Service Mesh', slug: 'web/architecture/service-mesh' },
                        ],
                    },
                    {
                        label: 'Backend',
                        collapsed: true,
                        items: [
                            { label: 'Database Connection', slug: 'web/backend/database-connection' },
                            { label: 'Overview', slug: 'web/backend/overview' },
                            { label: 'Server Side', slug: 'web/backend/server-side' },
                        ],
                    },
                    {
                        label: 'Frontend',
                        collapsed: true,
                        items: [
                            { label: 'Browser Rendering', slug: 'web/frontend/browser-rendering' },
                            { label: 'CSS Layout', slug: 'web/frontend/css-layout' },
                            { label: 'JavaScript Runtime', slug: 'web/frontend/javascript-runtime' },
                            { label: 'Overview', slug: 'web/frontend/overview' },
                            { label: 'Performance', slug: 'web/frontend/performance' },
                        ],
                    },
                    {
                        label: 'API',
                        collapsed: true,
                        items: [
                            { label: 'API Security Fundamentals', slug: 'web/api/api-security-fundamentals' },
                            { label: 'Rate Limiting', slug: 'web/api/rate-limiting' },
                            { label: 'Input Validation', slug: 'web/api/input-validation' },
                        ],
                    },
                    {
                        label: 'Hosting',
                        collapsed: true,
                        items: [
                            { label: 'CI CD', slug: 'web/hosting/ci-cd' },
                            { label: 'Cloud Hosting', slug: 'web/hosting/cloud-hosting' },
                            { label: 'Deployment Overview', slug: 'web/hosting/deployment-overview' },
                            { label: 'Web Servers', slug: 'web/hosting/web-servers' },
                        ],
                    },
                    {
                        label: 'HTTP',
                        collapsed: true,
                        items: [
                            { label: 'How Web Works', slug: 'web/http/how-web-works' },
                            { label: 'HTTP Fundamentals', slug: 'web/http/http-fundamentals' },
                            { label: 'HTTPS TLS', slug: 'web/http/https-tls' },
                        ],
                    },
                ]
            },
            {
                label: 'Tools',
                collapsed: true,
                items: [
                    { label: 'Tool Commands', slug: 'tools/tool-comands' },
                    { label: 'Tools', slug: 'tools/tools' },
                ],
            },
            {
                label: 'Tools', slug: 'overview' 
                
            }
        ],
        }), sitemap(), react()],
});