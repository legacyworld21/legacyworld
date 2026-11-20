import { useState } from 'react';
import { Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen } from '../src/components/ui';
import { supabase } from '../src/lib/supabase';
import { colors, radius, type } from '../src/theme';

const input = { color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14 } as const;

export default function Login() {
  const [mode, setMode] = useState<'in' | 'up'>('up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setMsg('');
    const res = mode === 'up'
      ? await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() } } })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (res.error) return setMsg(res.error.message);
    if (mode === 'up' && !res.data.session) return setMsg('Revisa tu correo para confirmar la cuenta y luego inicia sesión.');
    router.back();
  };

  return (
    <Screen eyebrow="Legacy Club" title={mode === 'up' ? 'Únete' : 'Entrar'}>
      <Text style={type.small}>Al crear tu cuenta entras al Legacy Club: 1$ = 1 punto.</Text>
      {mode === 'up' && <TextInput style={input} placeholder="Nombre" placeholderTextColor={colors.muted} value={name} onChangeText={setName} />}
      <TextInput style={input} placeholder="Correo" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={input} placeholder="Contraseña (mín. 6)" placeholderTextColor={colors.muted} secureTextEntry value={password} onChangeText={setPassword} />
      {!!msg && <Text style={{ color: colors.danger }}>{msg}</Text>}
      <Button label={busy ? '...' : mode === 'up' ? 'CREAR CUENTA' : 'ENTRAR'} onPress={submit} />
      <Button variant="ghost" label={mode === 'up' ? 'Ya tengo cuenta' : 'Crear cuenta nueva'} onPress={() => setMode(mode === 'up' ? 'in' : 'up')} />
    </Screen>
  );
}
