"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { QuizPdfImport } from "@/components/admin/quiz-pdf-import";
import {
  createQuiz,
  updateQuizTitle as saveQuizTitle,
  addQuestion as addQuestionAction,
  updateQuestion as updateQuestionAction,
  deleteQuestion as deleteQuestionAction,
  addAnswer as addAnswerAction,
  updateAnswer as updateAnswerAction,
  setCorrectAnswer as setCorrectAnswerAction,
  deleteAnswer as deleteAnswerAction,
  loadQuizData,
} from "@/lib/admin/quiz-actions";

interface Answer {
  id: string;
  answer_text: string;
  is_correct: boolean;
  feedback: string;
}

interface Question {
  id: string;
  question_text: string;
  order_index: number;
  answers: Answer[];
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export default function QuizEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);

  useEffect(() => {
    loadQuiz();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  async function loadQuiz() {
    setLoading(true);
    const data = await loadQuizData(lessonId);
    if (data) {
      const questions: Question[] = ((data.quiz_questions as {
        id: string; question_text: string; order_index: number;
        quiz_answers: { id: string; answer_text: string; is_correct: boolean; feedback: string | null }[];
      }[]) ?? [])
        .sort((a, b) => a.order_index - b.order_index)
        .map((q) => ({
          id: q.id,
          question_text: q.question_text,
          order_index: q.order_index,
          answers: (q.quiz_answers ?? []).map((a) => ({ ...a, feedback: a.feedback ?? "" })),
        }));
      setQuiz({ id: data.id, title: data.title, questions });
    }
    setLoading(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => {
      router.push(`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
    }, 800);
  }

  async function handleCreateQuiz() {
    if (!newQuizTitle.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const data = await createQuiz(lessonId, newQuizTitle.trim());
        setQuiz({ id: data.id, title: data.title, questions: [] });
        setNewQuizTitle("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  async function handleUpdateTitle(title: string) {
    if (!quiz) return;
    await saveQuizTitle(quiz.id, title);
    setQuiz((q) => q ? { ...q, title } : q);
  }

  async function handleAddQuestion() {
    if (!quiz || !newQuestionText.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const data = await addQuestionAction(quiz.id, newQuestionText.trim(), quiz.questions.length);
        setQuiz((q) => q ? { ...q, questions: [...q.questions, { ...data, answers: [] }] } : q);
        setNewQuestionText("");
        setAddingQuestion(false);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  async function handleDeleteQuestion(questionId: string) {
    await deleteQuestionAction(questionId);
    setQuiz((q) => q ? { ...q, questions: q.questions.filter((qu) => qu.id !== questionId) } : q);
  }

  async function handleUpdateQuestion(questionId: string, text: string) {
    await updateQuestionAction(questionId, text);
    setQuiz((q) => q ? {
      ...q,
      questions: q.questions.map((qu) => qu.id === questionId ? { ...qu, question_text: text } : qu),
    } : q);
  }

  async function handleAddAnswer(questionId: string) {
    try {
      const data = await addAnswerAction(questionId);
      setQuiz((q) => q ? {
        ...q,
        questions: q.questions.map((qu) =>
          qu.id === questionId ? { ...qu, answers: [...qu.answers, data] } : qu
        ),
      } : q);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleUpdateAnswer(questionId: string, answerId: string, fields: Partial<Answer>) {
    await updateAnswerAction(answerId, fields);
    setQuiz((q) => q ? {
      ...q,
      questions: q.questions.map((qu) =>
        qu.id === questionId
          ? { ...qu, answers: qu.answers.map((a) => a.id === answerId ? { ...a, ...fields } : a) }
          : qu
      ),
    } : q);
  }

  async function handleSetCorrect(questionId: string, answerId: string) {
    await setCorrectAnswerAction(questionId, answerId);
    setQuiz((q) => q ? {
      ...q,
      questions: q.questions.map((qu) =>
        qu.id === questionId
          ? { ...qu, answers: qu.answers.map((a) => ({ ...a, is_correct: a.id === answerId })) }
          : qu
      ),
    } : q);
  }

  async function handleDeleteAnswer(questionId: string, answerId: string) {
    await deleteAnswerAction(answerId);
    setQuiz((q) => q ? {
      ...q,
      questions: q.questions.map((qu) =>
        qu.id === questionId ? { ...qu, answers: qu.answers.filter((a) => a.id !== answerId) } : qu
      ),
    } : q);
  }

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Se încarcă quiz-ul...</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
            <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`}>
              <ArrowLeft size={16} />
              Înapoi la lecție
            </Link>
          </Button>
          {quiz && (
            <Button
              onClick={handleSave}
              disabled={saved}
              className="gap-2 bg-teal-500 hover:bg-teal-600 text-white"
            >
              {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {saved ? "Salvat!" : "Salvează quiz-ul"}
            </Button>
          )}
        </div>
        <h1 className="text-2xl font-bold">Editor Quiz</h1>
        <p className="text-sm text-gray-500 mt-1">
          Adaugă și gestionează întrebările pentru quiz-ul acestei lecții.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      {!quiz ? (
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-semibold mb-4">Creează quiz-ul lecției</h2>
          <div className="space-y-3">
            <div>
              <Label>Titlul quiz-ului</Label>
              <Input
                value={newQuizTitle}
                onChange={(e) => setNewQuizTitle(e.target.value)}
                placeholder="ex: Ce știi despre emoții?"
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleCreateQuiz}
              disabled={isPending || !newQuizTitle.trim()}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2"
            >
              <Plus size={16} />
              Creare quiz
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Quiz title */}
          <div className="bg-white rounded-2xl border p-4 mb-6">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Titlu quiz</Label>
            <QuizTitleEditor title={quiz.title} onSave={handleUpdateTitle} />
          </div>

          {/* Questions */}
          <div className="space-y-4 mb-4">
            {quiz.questions.map((question, qIdx) => (
              <div key={question.id} className="bg-white rounded-2xl border overflow-hidden">
                <div className="bg-blue-50 border-b px-4 py-3 flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <QuestionEditor
                    text={question.question_text}
                    onSave={(text) => handleUpdateQuestion(question.id, text)}
                  />
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"
                    title="Șterge întrebarea"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  {question.answers.map((answer) => (
                    <div
                      key={answer.id}
                      className={`rounded-xl border p-3 ${answer.is_correct ? "border-teal-400 bg-teal-50" : "border-gray-200"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => handleSetCorrect(question.id, answer.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            answer.is_correct
                              ? "border-teal-500 bg-teal-500 text-white"
                              : "border-gray-300 hover:border-teal-400"
                          }`}
                          title="Marchează ca răspuns corect"
                        >
                          {answer.is_correct && <Check size={10} />}
                        </button>
                        <AnswerEditor
                          text={answer.answer_text}
                          onSave={(text) => handleUpdateAnswer(question.id, answer.id, { answer_text: text })}
                        />
                        <button
                          onClick={() => handleDeleteAnswer(question.id, answer.id)}
                          className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <FeedbackEditor
                        text={answer.feedback}
                        onSave={(text) => handleUpdateAnswer(question.id, answer.id, { feedback: text })}
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddAnswer(question.id)}
                    className="w-full text-sm text-blue-500 hover:text-blue-700 border border-dashed border-blue-200 hover:border-blue-400 rounded-xl py-2 transition-colors"
                  >
                    + Adaugă răspuns
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Import din PDF */}
          <QuizPdfImport
            quizId={quiz.id}
            startingIndex={quiz.questions.length}
            onImported={loadQuiz}
          />

          {/* Add question */}
          {addingQuestion ? (
            <div className="bg-white rounded-2xl border p-4">
              <Label className="text-sm font-semibold">Întrebarea nouă</Label>
              <Textarea
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Scrie întrebarea aici..."
                rows={2}
                className="mt-2 mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddQuestion}
                  disabled={isPending || !newQuestionText.trim()}
                  size="sm"
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-1"
                >
                  <Plus size={14} />
                  Adaugă
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setAddingQuestion(false); setNewQuestionText(""); }}
                >
                  Anulează
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setAddingQuestion(true)}
              className="w-full gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700"
            >
              <Plus size={16} />
              Adaugă întrebare
            </Button>
          )}

          <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-700">
            <strong>Sfat:</strong> Apasă pe cercul din stânga unui răspuns pentru a-l marca ca{" "}
            <span className="font-semibold">răspuns corect</span>. Fiecare întrebare trebuie să aibă exact un răspuns corect.
          </div>

          <Button
            onClick={handleSave}
            disabled={saved}
            size="lg"
            className="w-full mt-4 gap-2 bg-teal-500 hover:bg-teal-600 text-white"
          >
            {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {saved ? "Salvat! Se revine la lecție..." : "Salvează quiz-ul"}
          </Button>
        </>
      )}
    </div>
  );
}

function QuizTitleEditor({ title, onSave }: { title: string; onSave: (t: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);

  if (!editing) {
    return (
      <button className="text-left font-semibold text-gray-800 hover:text-blue-600 mt-1 w-full" onClick={() => setEditing(true)}>
        {value} <span className="text-xs text-gray-400 font-normal">(click pentru editare)</span>
      </button>
    );
  }
  return (
    <div className="flex gap-2 mt-1">
      <Input value={value} onChange={(e) => setValue(e.target.value)} className="flex-1" autoFocus />
      <Button size="sm" onClick={() => { onSave(value); setEditing(false); }} className="gap-1 bg-teal-500 hover:bg-teal-600 text-white">
        <Save size={14} />
      </Button>
    </div>
  );
}

function QuestionEditor({ text, onSave }: { text: string; onSave: (t: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);

  if (!editing) {
    return (
      <button className="flex-1 text-left font-semibold text-gray-800 hover:text-blue-600" onClick={() => setEditing(true)}>
        {value}
      </button>
    );
  }
  return (
    <div className="flex-1 flex gap-2">
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={2} className="flex-1 text-sm" autoFocus />
      <Button size="sm" onClick={() => { onSave(value); setEditing(false); }} className="self-start gap-1 bg-teal-500 hover:bg-teal-600 text-white">
        <Save size={14} />
      </Button>
    </div>
  );
}

function AnswerEditor({ text, onSave }: { text: string; onSave: (t: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);

  if (!editing) {
    return (
      <button className="flex-1 text-left text-sm text-gray-700 hover:text-blue-600" onClick={() => setEditing(true)}>
        {value}
      </button>
    );
  }
  return (
    <div className="flex-1 flex gap-2">
      <Input value={value} onChange={(e) => setValue(e.target.value)} className="flex-1 text-sm h-8" autoFocus />
      <Button size="sm" onClick={() => { onSave(value); setEditing(false); }} className="h-8 gap-1 bg-teal-500 hover:bg-teal-600 text-white px-2">
        <Save size={12} />
      </Button>
    </div>
  );
}

function FeedbackEditor({ text, onSave }: { text: string; onSave: (t: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);

  if (!editing) {
    return (
      <button className="text-xs text-gray-400 hover:text-blue-500 italic" onClick={() => setEditing(true)}>
        {value ? `Feedback: ${value}` : "+ Adaugă feedback (opțional)"}
      </button>
    );
  }
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Feedback pentru acest răspuns..."
        className="flex-1 text-xs h-7"
        autoFocus
      />
      <Button size="sm" onClick={() => { onSave(value); setEditing(false); }} className="h-7 gap-1 bg-teal-500 hover:bg-teal-600 text-white px-2">
        <Save size={12} />
      </Button>
    </div>
  );
}
