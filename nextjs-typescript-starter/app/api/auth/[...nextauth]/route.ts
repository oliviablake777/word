function mockOnlyResponse() {
  return Response.json(
    {
      ok: false,
      error: {
        code: 'MOCK_FRONTEND_ONLY',
        message: '当前版本使用浏览器 Mock 登录，真实认证接口暂未启用。',
      },
    },
    { status: 501 },
  );
}

export const GET = mockOnlyResponse;
export const POST = mockOnlyResponse;
