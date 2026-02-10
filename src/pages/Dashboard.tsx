import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, ListChecks } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-4 pb-2">
          <CardTitle className="text-xl font-medium">
            ダッシュボード
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            ノートの作成やクイズの管理ができます。
          </p>
        </CardHeader>
        <CardContent className="px-4 space-y-3">
          <Link
            to="/notes/new"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FilePlus className="h-5 w-5 text-slate-600" />
            <span className="font-medium">ノートを作成</span>
          </Link>
          <Link
            to="/quizzes"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ListChecks className="h-5 w-5 text-slate-600" />
            <span className="font-medium">クイズ管理</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
