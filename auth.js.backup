// 인증 관련 함수들을 관리하는 모듈
// 전역 변수
let isLogin = true;

// 초기 상태 설정
document.addEventListener('DOMContentLoaded', () => {
    // 페이지 로드 시 로그인 모드로 초기화
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.required = false;
    }
});


// 로그인/회원가입 모드 토글
function toggleAuthMode() {
    console.log('🔄 인증 모드 토글:', isLogin ? '회원가입으로' : '로그인으로');
    isLogin = !isLogin;
    
    const authTitle = document.getElementById('authTitle');
    const authButton = document.getElementById('authButton');
    const authSwitchText = document.getElementById('authSwitchText');
    const authSwitchLink = document.getElementById('authSwitchLink');
    const usernameGroup = document.getElementById('usernameGroup');
    const usernameField = document.getElementById('username');
    
    if (isLogin) {
        authTitle.textContent = '로그인';
        authButton.textContent = '로그인';
        authSwitchText.textContent = '계정이 없으신가요?';
        authSwitchLink.textContent = '회원가입';
        usernameGroup.style.display = 'none';
        usernameField.required = false;
        usernameField.value = '';
    } else {
        authTitle.textContent = '회원가입';
        authButton.textContent = '회원가입';
        authSwitchText.textContent = '이미 계정이 있으신가요?';
        authSwitchLink.textContent = '로그인';
        usernameGroup.style.display = 'block';
        usernameField.required = true;
    }
    
    console.log('✅ 인증 모드 변경 완료:', isLogin ? '로그인' : '회원가입');
}

// 인증 폼 설정
function setupAuthForm(supabase, showNotification, showDashboard) {
    const authForm = document.getElementById('authForm');
    const authButton = document.getElementById('authButton');
    
    console.log('🔧 setupAuthForm 호출됨');
    
    if (!authForm || !authButton) {
        console.error('❌ 폼 요소를 찾을 수 없습니다:', { authForm, authButton });
        return;
    }

    authForm.addEventListener('submit', async (e) => {
        console.log('📝 폼 제출 이벤트 발생');
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🔍 Supabase 상태:', !!supabase);
        
        if (!supabase) {
            console.error('❌ Supabase가 연결되지 않았습니다.');
            showNotification('error', 'Supabase가 연결되지 않았습니다.');
            return;
        }

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const username = document.getElementById('username').value.trim();

        console.log('📧 입력값 확인:', { 
            email: email ? '입력됨' : '비어있음', 
            password: password ? '입력됨' : '비어있음',
            username: username ? '입력됨' : '비어있음',
            isLogin 
        });

        // 입력값 검증
        if (!email || !password) {
            showNotification('error', '이메일과 비밀번호를 입력해주세요.');
            return;
        }

        if (!isLogin && !username) {
            showNotification('error', '사용자명을 입력해주세요.');
            return;
        }

        // 로딩 상태
        const originalText = authButton.innerHTML;
        authButton.innerHTML = '<div class="loading"></div> 처리 중...';
        authButton.disabled = true;

        try {
            console.log(`🚀 ${isLogin ? '로그인' : '회원가입'} 시도 중...`);
            
            if (isLogin) {
                // 로그인
                console.log('🔑 로그인 요청 전송...');
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                console.log('🔑 로그인 응답:', { data: !!data, error: error?.message });

                if (error) {
                    console.error('❌ 로그인 에러:', error);
                    throw error;
                }

                if (data.user) {
                    console.log('✅ 로그인 성공:', data.user.email);
                    window.currentUser = data.user;
                    showNotification('success', '✅ 로그인 성공!');
                    await showDashboard();
                } else {
                    throw new Error('사용자 데이터를 받지 못했습니다.');
                }
            } else {
                // 회원가입
                console.log('📝 회원가입 요청 전송...');
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            username: username
                        }
                    }
                });

                console.log('📝 회원가입 응답:', { data: !!data, error: error?.message });

                if (error) {
                    console.error('❌ 회원가입 에러:', error);
                    throw error;
                }

                if (data.user && !data.user.identities?.length) {
                    // 이미 가입된 사용자
                    showNotification('error', '이미 가입된 이메일입니다. 로그인을 시도해주세요.');
                    return;
                }

                if (data.user) {
                    console.log('📊 사용자 테이블에 정보 저장 중...');
                    // 사용자 정보를 users 테이블에 저장
                    const { error: insertError } = await supabase
                        .from('users')
                        .insert([
                            { 
                                id: data.user.id,
                                username: username,
                                email: email,
                                coin_balance: 10 // 가입 보너스
                            }
                        ]);

                    if (insertError) {
                        console.error('❌ 사용자 테이블 저장 에러:', insertError);
                        // 사용자 테이블 저장 실패해도 가입은 성공
                        console.log('⚠️ 사용자 테이블 저장 실패했지만 가입은 성공');
                    }

                    window.currentUser = data.user;
                    showNotification('success', '🎉 회원가입 완료! 가입 보너스 10코인을 받았습니다!');
                    console.log('✅ 회원가입 성공:', data.user.email);
                    await showDashboard();
                } else {
                    console.log('📧 이메일 인증 필요');
                    showNotification('info', '📧 이메일 인증이 필요합니다. 메일함을 확인해주세요.');
                }
            }
        } catch (error) {
            console.error('❌ 인증 처리 중 오류:', error);
            let errorMessage = '인증에 실패했습니다: ' + error.message;
            
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = '이메일 또는 비밀번호가 잘못되었습니다.';
            } else if (error.message.includes('User already registered')) {
                errorMessage = '이미 가입된 이메일입니다.';
            } else if (error.message.includes('Password should be at least 6 characters')) {
                errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.';
            } else if (error.message.includes('signup_disabled')) {
                errorMessage = '회원가입이 비활성화되어 있습니다.';
            }
            
            showNotification('error', '❌ ' + errorMessage);
        } finally {
            console.log('🔄 로딩 상태 해제');
            // 로딩 상태 해제
            authButton.innerHTML = originalText;
            authButton.disabled = false;
        }
    });
    
    console.log('✅ 폼 이벤트 리스너 등록 완료');
}

// 사용자 상태 확인
async function checkUser(supabase, showDashboard, showAuthForm) {
    if (!supabase) return;
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            window.currentUser = user;
            await showDashboard();
        } else {
            showAuthForm();
        }
    } catch (error) {
        console.error('사용자 확인 오류:', error);
        showAuthForm();
    }
}

// 로그아웃
async function logout(supabase, showNotification, showAuthForm) {
    if (!supabase) return;

    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        window.currentUser = null;
        showNotification('info', '로그아웃되었습니다.');
        showAuthForm();
    } catch (error) {
        console.error('로그아웃 오류:', error);
        showNotification('error', '로그아웃에 실패했습니다.');
    }
}

// 인증 폼 표시
function showAuthForm() {
    const authContainer = document.getElementById('authContainer');
    const dashboard = document.getElementById('dashboard');
    const userInfo = document.getElementById('userInfo');
    
    authContainer.style.display = 'block';
    dashboard.style.display = 'none';
    userInfo.style.display = 'none';
}

// 대시보드 표시
async function showDashboard(supabase, showNotification) {
    if (!window.currentUser || !supabase) return;

    try {
        // 사용자 정보 가져오기
        const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', window.currentUser.id)
            .single();

        if (error) {
            console.log('사용자 데이터 없음, 기본값 사용:', error);
            // users 테이블에 데이터가 없으면 기본값 사용
            userData = {
                username: window.currentUser.user_metadata?.username || window.currentUser.email?.split('@')[0] || 'User',
                coin_balance: 0
            };
        }

        // UI 업데이트
        const authContainer = document.getElementById('authContainer');
        const dashboard = document.getElementById('dashboard');
        const userInfo = document.getElementById('userInfo');
        
        authContainer.style.display = 'none';
        dashboard.style.display = 'block';
        userInfo.style.display = 'flex';

        // 사용자 정보 표시
        document.getElementById('welcomeUsername').textContent = userData.username || 'User';
        document.getElementById('coinBalance').textContent = userData.coin_balance || 0;
        document.getElementById('totalCoins').textContent = userData.coin_balance || 0;

        // 임시 데이터 (나중에 실제 데이터로 교체)
        document.getElementById('totalPlays').textContent = '0';
        document.getElementById('totalInvestments').textContent = '0';
        document.getElementById('totalDividends').textContent = '0';

        console.log('✅ 대시보드 로드 완료');
        showNotification('success', '✅ 로그인 완료! 메인 홈으로 이동합니다.');
    } catch (error) {
        console.error('대시보드 로드 오류:', error);
        showNotification('error', '❌ 대시보드 로드에 실패했습니다: ' + error.message);
    }
}
