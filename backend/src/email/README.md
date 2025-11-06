# Configuração de Envio de E-mails

Este documento explica como configurar o sistema de envio de e-mails do JCoder.

## Variáveis de Ambiente Necessárias

O sistema utiliza as seguintes variáveis de ambiente para configurar o servidor SMTP:

### Variáveis Obrigatórias

#### `SMTP_USER`
- **Descrição**: E-mail do remetente (conta que enviará os e-mails)
- **Exemplo**: `seu-email@gmail.com`
- **Uso**: Usado para autenticação no servidor SMTP

#### `SMTP_PASS`
- **Descrição**: Senha ou token de autenticação para o e-mail
- **Exemplo**: `sua-senha-de-app` (para Gmail) ou `sua-senha-normal` (para outros provedores)
- **Uso**: Usado junto com `SMTP_USER` para autenticação no servidor SMTP
- **⚠️ Importante**: Para Gmail, você precisa usar uma **Senha de App**, não a senha normal da conta

### Variáveis Opcionais (com valores padrão)

#### `SMTP_HOST`
- **Descrição**: Endereço do servidor SMTP
- **Padrão**: `smtp.gmail.com` (se não especificado)
- **Exemplos por provedor**:
  - Gmail: `smtp.gmail.com`
  - Outlook/Hotmail: `smtp-mail.outlook.com`
  - Yahoo: `smtp.mail.yahoo.com`
  - SendGrid: `smtp.sendgrid.net`
  - Amazon SES: `email-smtp.us-east-1.amazonaws.com`

#### `SMTP_PORT`
- **Descrição**: Porta do servidor SMTP
- **Padrão**: `587` (se não especificado)
- **Valores comuns**:
  - `587`: Porta padrão para TLS/STARTTLS (recomendado)
  - `465`: Porta para SSL (requer `SMTP_SECURE=true`)
  - `25`: Porta não criptografada (não recomendado)

#### `SMTP_SECURE`
- **Descrição**: Define se a conexão deve usar SSL/TLS
- **Padrão**: `false` (se não especificado)
- **Valores**:
  - `false`: Usa STARTTLS na porta 587 (recomendado)
  - `true`: Usa SSL direto na porta 465
- **⚠️ Nota**: Se usar porta 465, defina como `true`

#### `SMTP_FROM`
- **Descrição**: Endereço de e-mail que aparecerá como remetente
- **Padrão**: Usa o valor de `SMTP_USER` se não especificado
- **Exemplo**: `noreply@seudominio.com`
- **Uso**: Aparece no campo "De:" dos e-mails enviados

### Variável Adicional (para links no e-mail)

#### `FRONTEND_BASE_URL`
- **Descrição**: URL base do frontend para gerar links no e-mail
- **Exemplo**: `http://localhost:3000` ou `https://seudominio.com`
- **Uso**: Usado para criar o link "Ver Portfólio" nos e-mails de notificação

## Exemplo de Arquivo .env

```env
# Configuração SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-aqui
SMTP_FROM=seu-email@gmail.com

# URL do Frontend (para links nos e-mails)
FRONTEND_BASE_URL=http://localhost:3000
```

## Configurações Externas Necessárias

### Para Gmail

O Gmail requer configurações especiais por questões de segurança:

#### 1. Habilitar Verificação em 2 Etapas
1. Acesse [Google Account Security](https://myaccount.google.com/security)
2. Ative a "Verificação em duas etapas"

#### 2. Gerar Senha de App
1. Acesse [App Passwords](https://myaccount.google.com/apppasswords)
2. Selecione "E-mail" e "Outro (nome personalizado)"
3. Digite um nome (ex: "JCoder Backend")
4. Clique em "Gerar"
5. **Copie a senha gerada** (16 caracteres sem espaços)
6. Use essa senha no `SMTP_PASS`

**⚠️ Importante**: 
- Não use sua senha normal do Gmail
- A senha de app é diferente da senha da conta
- Guarde a senha de app com segurança

#### 3. Permitir Aplicativos Menos Seguros (NÃO RECOMENDADO)
- Esta opção foi descontinuada pelo Google
- Use sempre Senhas de App

### Para Outlook/Hotmail

1. Use sua senha normal da conta Microsoft
2. Pode ser necessário habilitar "Aplicativos menos seguros" nas configurações
3. Configuração recomendada:
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_SECURE=false
   ```

### Para SendGrid

1. Crie uma conta em [SendGrid](https://sendgrid.com/)
2. Gere uma API Key nas configurações
3. Use a API Key como `SMTP_PASS`
4. Configuração:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=sua-api-key-aqui
   ```

### Para Amazon SES

1. Configure o Amazon SES na AWS
2. Verifique seu domínio ou e-mail
3. Crie credenciais SMTP
4. Configuração:
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=sua-access-key-id
   SMTP_PASS=sua-secret-access-key
   ```

## Como Funciona no Código

### Inicialização do Transportador

```typescript
// backend/src/email/email.service.ts (linhas 10-19)
this.transporter = nodemailer.createTransport({
    host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
    port: this.configService.get<number>('SMTP_PORT') || 587,
    secure: this.configService.get<boolean>('SMTP_SECURE') || false,
    auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
    },
});
```

### Envio de E-mail

```typescript
// backend/src/email/email.service.ts (linhas 127-136)
const from = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER');

await this.transporter.sendMail({
    to,
    subject,
    html: htmlContent,
    text: textContent,
    from: `"JCoder" <${from}>`,
});
```

## Testando a Configuração

### 1. Verificar Variáveis de Ambiente

Certifique-se de que todas as variáveis estão definidas no arquivo `.env` na raiz do projeto.

### 2. Testar Envio

Quando uma mensagem for criada através do endpoint:
```
POST /api/v1/:username/messages
```

O sistema automaticamente:
1. Salva a mensagem no banco de dados
2. Envia um e-mail de notificação para o administrador

### 3. Verificar Logs

Se houver erro no envio, verifique os logs do backend. Erros comuns:

- **"Invalid login"**: Credenciais incorretas
- **"Connection timeout"**: Problema de rede ou host/porta incorretos
- **"Authentication failed"**: Para Gmail, certifique-se de usar Senha de App

## Segurança

### Boas Práticas

1. **Nunca commite o arquivo `.env`** no Git
2. **Use Senhas de App** para Gmail (não a senha normal)
3. **Rotacione credenciais** periodicamente
4. **Use variáveis de ambiente** em produção (não arquivo .env)
5. **Limite permissões** da conta de e-mail usada

### Em Produção

- Use serviços de e-mail transacional (SendGrid, Amazon SES, Mailgun)
- Configure SPF, DKIM e DMARC no seu domínio
- Monitore taxas de entrega e spam
- Implemente rate limiting (já implementado: 5 mensagens/minuto)

## Troubleshooting

### E-mails não estão sendo enviados

1. Verifique se todas as variáveis estão definidas
2. Teste as credenciais manualmente
3. Verifique logs de erro no console
4. Confirme que o servidor SMTP está acessível
5. Para Gmail, verifique se a Senha de App está correta

### E-mails vão para spam

1. Configure SPF no seu domínio
2. Configure DKIM
3. Use um serviço de e-mail transacional
4. Evite palavras que triggeram spam no assunto/corpo

### Erro de autenticação

- Gmail: Use Senha de App, não senha normal
- Outlook: Pode precisar habilitar "Aplicativos menos seguros"
- Verifique se `SMTP_USER` e `SMTP_PASS` estão corretos
- Confirme que a porta e `SMTP_SECURE` estão corretos

