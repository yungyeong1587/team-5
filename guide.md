1. project/ai_models/ 경로에 model.safetensors을 넣어주세요.

2. project/backend/ 경로에 .env 파일을 생성해주세요.

   2.1. .env 파일의 내용은 다음과 같습니다.

   GEMINI_API_KEY=본인 GEMINI API KEY 사용

3. project/에서 node 모듈 및 lucide-react 패키지를 설치해주세요.

4. 실행 방법

   4.1. 프론트엔드

   project/에서 npm run dev

   4.2. 백엔드

   project/backend/ 경로에서 uvicorn main:app --reload --port 8000



* 위 실행 방법은 로컬 개발 환경 기준으로, 학과 서버로 migration 하는 경우에 달라질 수 있습니다.