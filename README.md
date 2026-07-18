# FitCRM (physiologic)

트레이너를 위한 회원 관리 웹 서비스. Next.js 14 + Supabase(Postgres, Auth)로 만들어졌습니다.

## 요구사항

- Node.js 18.17 이상 (권장: 20 LTS)
- npm

## 처음 설치

```bash
git clone https://github.com/bungae0312/physiologic.git
cd physiologic
npm install
```

프로젝트 루트에 `.env.local` 파일을 만들고 아래 두 값을 채워주세요.
(이 값은 git에 올라가지 않으므로 별도로 전달받아야 합니다. `.env.local.example` 참고)

```
NEXT_PUBLIC_SUPABASE_URL=여기에_Supabase_Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_Supabase_anon_public_키
```

> 이 프로젝트는 이미 만들어진 Supabase 프로젝트(데이터베이스+로그인) 하나를 그대로 씁니다.
> 서버를 새로 올릴 때 **Supabase를 새로 만들 필요 없이**, 기존에 쓰던 두 값만 그대로 넣으면
> 지금까지 등록된 회원 데이터가 그대로 보입니다. (`supabase/schema.sql`은 이미 한 번 실행되어 있어
> 다시 실행할 필요 없습니다 — 실수로 다시 실행해도 안전하게 무시되도록 작성되어 있습니다.)

## 로컬에서 실행 (개발용)

```bash
npm run dev
```

`http://localhost:3000` 에서 확인.

## 운영 서버에 올리기 (프로덕션)

```bash
npm run build
npm start
```

`npm start`는 기본적으로 3000번 포트에서 서버를 띄웁니다. AWS EC2 등에 올릴 경우:

1. 서버가 재부팅되거나 죽어도 자동으로 다시 켜지도록 **PM2** 같은 프로세스 매니저 사용을 권장합니다.
   ```bash
   npm install -g pm2
   pm2 start npm --name fitcrm -- start
   pm2 save
   pm2 startup
   ```
2. 도메인 연결 및 HTTPS가 필요하면 **nginx**를 리버스 프록시로 앞단에 두고, Let's Encrypt(certbot)로 인증서를 발급받는 방식을 권장합니다.
3. 보안그룹(방화벽)에서 80/443 포트를 열어주세요. 3000번 포트를 외부에 직접 열어두는 것은 권장하지 않습니다 (nginx를 통해서만 접근하도록).

## 배포 시 체크리스트

- [ ] `.env.local`에 Supabase URL/키가 정확히 들어갔는지
- [ ] `npm run build`가 에러 없이 끝나는지
- [ ] Supabase 대시보드 > Authentication > Email 설정에서 "Confirm email"을 켤지 결정 (꺼져있으면 아무 이메일로나 가입 가능)
