// 인증 관련 함수들을 관리하는 모듈

// 전역 변수
let isLogin = true;

// 로그인/회원가입 모드 토글
function toggleAuthMode() {
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
    } else {
        authTitle.textContent = '회원가입';
        authButton.textContent = '회원가입';
        authSwitchText.textContent = '이미 계정이 있으신가요?';
        authSwitchLink.textContent = '로그인';
        usernameGroup.style.display = 'block';
        usernameField.required = true;
    }
}

// 인증 폼 설정
function setupAuthForm(supabase, showNotification, showDashboard) {
    const authForm = document.getElementById('authForm');
    const authButton = document.getElementById('authButton');
    
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!supabase) {
            showNotification('error', 'Supabase가 연결되지 않았습니다.');
            return;
        }

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;

        // 로딩 상태
        authButton.innerHTML = '<div class="loading"></div> 처리 중...';
        authButton.disabled = true;

        try {
            if (isLogin) {
                // 로그인
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                window.currentUser = data.user;
                showNotification('success', '✅ 로그인 성공!');
                await showDashboard();
            } else {
                // 회원가입
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username
                        }
                    }
                });

                if (error) throw error;

                if (data.user) {
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

                    if (insertError) throw insertError;

                    window.currentUser = data.user;
                    showNotification('success', '🎉 회원가입 완료! 가입 보너스 10코인을 받았습니다!');
                    await showDashboard();
                } else {
                    showNotification('info', '📧 이메일 인증이 필요합니다. 메일함을 확인해주세요.');
                }
            }
        } catch (error) {
            console.error('인증 오류:', error);
            let errorMessage = '인증에 실패했습니다.';
            
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = '이메일 또는 비밀번호가 잘못되었습니다.';
            } else if (error.message.includes('User already registered')) {
                errorMessage = '이미 가입된 이메일입니다.';
            } else if (error.message.includes('Password should be at least 6 characters')) {
                errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.';
            }
            
            showNotification('error', '❌ ' + errorMessage);
        } finally {
            // 로딩 상태 해제
            authButton.innerHTML = isLogin ? '로그인' : '회원가입';
            authButton.disabled = false;
        }
    });
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

        if (error) throw error;

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
    } catch (error) {
        console.error('대시보드 로드 오류:', error);
        showNotification('error', '대시보드 로드에 실패했습니다.');
    }
}
