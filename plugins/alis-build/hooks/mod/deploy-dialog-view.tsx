/* @jsxRuntime classic */
/* @jsx h */
// Draws the deploy confirmation dialog. Abort holds the focus, so Enter on a
// reflex does nothing dangerous; Approve is a deliberate move.
import type { RenderElement } from 'claude-code'

import type { DeployPrompt } from './deploy-dialog'
import type { PaneKit } from './ops-pane-view'

export function renderDeployDialog(kit: PaneKit, prompt: DeployPrompt, actions: { approve: () => void; abort: () => void }): RenderElement {
  const { Box, Text, Button } = kit
  const production = prompt.environments.some(env => env.production) || prompt.confirmProduction
  return (
    <Box flexDirection="column" key="alis-deploy">
      <Text bold color={production ? 'red' : undefined}>
        {production ? 'Production deploy' : 'Deploy'}
      </Text>
      <Box marginTop={1}>
        <Text dimColor>target: </Text>
        <Text bold>{prompt.target}</Text>
      </Box>
      <Box>
        <Text dimColor>version: </Text>
        <Text>{prompt.version}</Text>
      </Box>
      <Box flexDirection="column" marginTop={prompt.environments.length + prompt.unresolved.length > 0 ? 1 : 0}>
        {prompt.environments.map(env => (
          <Box key={env.id}>
            <Text dimColor>{'environment: '}</Text>
            <Text bold={env.production} color={env.production ? 'red' : undefined}>
              {env.displayName}
            </Text>
            <Text dimColor>{` (${env.id}) · ${env.status || 'status unknown'}${env.production ? ' · PRODUCTION' : ''}`}</Text>
          </Box>
        ))}
        {prompt.unresolved.map(id => (
          <Box key={`u:${id}`}>
            <Text dimColor>{'environment: '}</Text>
            <Text color="yellow">{`${id} (not found in this product's list)`}</Text>
          </Box>
        ))}
        {prompt.environments.length === 0 && prompt.unresolved.length === 0 ? (
          <Text color="yellow">environment: not given and not resolved; the CLI decides</Text>
        ) : null}
      </Box>
      {prompt.confirmProduction ? (
        <Box marginTop={1}>
          <Text dimColor>The command carries --confirm-production; the CLI will not ask again.</Text>
        </Box>
      ) : null}
      <Box marginTop={1}>
        <Button key="abort" label="Abort" autoFocus onPress={actions.abort} />
        <Text> </Text>
        <Button key="approve" label="Approve" onPress={actions.approve} />
        <Text dimColor>{'  Esc aborts'}</Text>
      </Box>
    </Box>
  )
}
