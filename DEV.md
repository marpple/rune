# 개발 유의 사항

## 라이브러리 개발
```shell
pnpm dev # 개발환경 실행
```
```shell
pnpm types:dev # 개발환경 실행
```
- 해당 라이브러리가 로컬 앱에 연결되어 있다면 해당 빌드파일이 바로 적용됩니다.

## 라이브러리 개발 완료
```shell
pnpm build # 라이브러리 빌드
pnpm types # 라이브러리 타입 정의 파일 생성
```
- 추가된 기능이나 수정된 기능이 있다면, 라이브러리를 빌드하고 타입 정의 파일을 생성합니다.
- 해당 라이브러리가 로컬 앱에 연결되어 있다면 해당 빌드파일이 바로 적용됩니다.

## 라이브러리 사용
```shell
pnpm link @rune/core
```

# TODO
- [ ] 라이브러리 배포
- [ ] 코드 리팩토링

# DOCS
- [RUNE VIEW TUTORIAL](./docs/core/rune.View/튜토리얼.md)
- [RUNE $ TUTORIAL](./docs/core/rune.$/튜토리얼.md)
