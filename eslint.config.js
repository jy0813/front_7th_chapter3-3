import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist', '**/*.tsbuildinfo'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // ========================================
      // FSD 아키텍처 규칙 (외부 패키지 없이)
      // ========================================

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // ❌ 문제 2: 상대 경로 금지
            {
              group: ['../*', './*'],
              message: '❌ 상대 경로는 사용할 수 없습니다. @ alias를 사용하세요. (예: @/shared/ui/Button)',
            },
            {
              group: ['**/index'],
              message: '❌ index.ts는 자동으로 resolve되므로 명시하지 마세요.',
            },
          ],
        },
      ],
    },
  },

  // ========================================
  // app 계층 규칙
  // ========================================
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', './*'],
              message: '❌ 상대 경로는 사용할 수 없습니다. @ alias를 사용하세요.',
            },
          ],
        },
      ],
    },
  },

  // ========================================
  // pages 계층 규칙
  // ========================================
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', './*'],
              message: '❌ 상대 경로는 사용할 수 없습니다. @ alias를 사용하세요.',
            },
            // ❌ 문제 1: 잘못된 레이어 import
            {
              group: ['@/app/*'],
              message: '❌ pages는 app을 import할 수 없습니다. (하위 → 상위 참조 금지)',
            },
          ],
        },
      ],
    },
  },

  // ========================================
  // widgets 계층 규칙
  // ========================================
  {
    files: ['src/widgets/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', './*'],
              message: '❌ 상대 경로는 사용할 수 없습니다. @ alias를 사용하세요.',
            },
            // ❌ 문제 1, 4: 잘못된 레이어 import (app 전체 금지)
            {
              group: ['@/app/*'],
              message: '❌ widgets는 app을 import할 수 없습니다. (하위 → 상위 참조 금지)\n💡 전역 상태가 필요하면 Context나 Props로 전달받으세요.',
            },
            {
              group: ['@/pages/*'],
              message: '❌ widgets는 pages를 import할 수 없습니다. (하위 → 상위 참조 금지)',
            },
          ],
        },
      ],
    },
  },

  // ========================================
  // features 계층 규칙 (가장 엄격)
  // ========================================
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', './*'],
              message: '❌ 상대 경로는 사용할 수 없습니다. @ alias를 사용하세요.',
            },
            // ❌ 문제 1: 잘못된 레이어 import
            {
              group: ['@/app/*'],
              message: '❌ features는 app을 import할 수 없습니다. (하위 → 상위 참조 금지)',
            },
            {
              group: ['@/pages/*'],
              message: '❌ features는 pages를 import할 수 없습니다. (하위 → 상위 참조 금지)',
            },
            {
              group: ['@/widgets/*'],
              message: '❌ features는 widgets를 import할 수 없습니다. (하위 → 상위 참조 금지)',
            },
            // ❌ 문제 3: Slice 간 의존성 금지
            {
              group: ['@/features/auth/*', '@/features/payment/*', '@/features/post/*', '@/features/comment/*', '@/features/user/*'],
              message: '❌ Feature 슬라이스 간 직접 의존성은 금지됩니다.\n💡 공통 로직은 entities나 shared로 추출하세요.',
            },
            // ❌ 문제 4: 전역 상태 직접 접근 금지
            {
              group: ['@/app/stores/*'],
              message: '❌ features는 전역 상태를 직접 import할 수 없습니다.\n💡 Context나 Props로 콜백을 받아 사용하세요.',
            },
          ],
        },
      ],
    },
  },

  // ========================================
  // entities 계층 규칙
  // ========================================
  {
    files: ['src/entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', './*'],
              message: '❌ 상대 경로는 사용할 수 없습니다. @ alias를 사용하세요.',
            },
            // ❌ 문제 1: 잘못된 레이어 import
            {
              group: ['@/app/*'],
              message: '❌ entities는 app을 import할 수 없습니다. (하위 → 상위 참조 금지)',
            },
            {
              group: ['@/pages/*'],
              message: '❌ entities는 pages를 import할 수 없습니다. (하위 → 상위 참조 금지)',
            },
            // ❌ 문제 5: 잘못된 UI 요소 import
            {
              group: ['@/widgets/*'],
              message: '❌ entities는 widgets를 import할 수 없습니다.\n💡 비즈니스 로직 계층에서 UI 위젯을 참조할 수 없습니다.',
            },
            {
              group: ['@/features/*'],
              message: '❌ entities는 features를 import할 수 없습니다. (하위 → 상위 참조 금지)',
            },
          ],
        },
      ],
    },
  },

  // ========================================
  // shared 계층 규칙 (가장 순수)
  // ========================================
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: '❌ 상대 경로는 사용할 수 없습니다. @ alias를 사용하세요.',
            },
            // ❌ shared는 어떤 계층도 import 불가
            {
              group: ['@/app/*'],
              message: '❌ shared는 app을 import할 수 없습니다.\n💡 shared는 완전히 독립적이어야 합니다.',
            },
            {
              group: ['@/pages/*'],
              message: '❌ shared는 pages를 import할 수 없습니다.\n💡 shared는 완전히 독립적이어야 합니다.',
            },
            {
              group: ['@/widgets/*'],
              message: '❌ shared는 widgets를 import할 수 없습니다.\n💡 shared는 완전히 독립적이어야 합니다.',
            },
            {
              group: ['@/features/*'],
              message: '❌ shared는 features를 import할 수 없습니다.\n💡 shared는 완전히 독립적이어야 합니다.',
            },
            {
              group: ['@/entities/*'],
              message: '❌ shared는 entities를 import할 수 없습니다.\n💡 도메인 타입이 필요하면 제네릭을 사용하세요.',
            },
          ],
        },
      ],
    },
  },

  // ========================================
  // TypeScript 최적화
  // ========================================
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  },
]
