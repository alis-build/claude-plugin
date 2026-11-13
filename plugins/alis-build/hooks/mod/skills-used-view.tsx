/* @jsxRuntime classic */
/* @jsx h */
// A Skill store skill in use, drawn twice. Its row, on the call that loaded
// it: the mark and the skill by name, in place of the call's own result (the
// skill's text, which the model reads and the person does not need again).
// And once the turn that used it has ended, one line above the prompt asking
// how it went: the row itself is in the terminal's scrollback by then, where
// nothing is redrawn and no button can be pressed.
import type { Elements, RenderElement, RenderSurface } from 'claude-code'

import { KEY, mark, type MarkKit } from './brand'
import { slotCells, under } from './ops-render'
import type { SkillActions, UsedSkill } from './skills-used'

export type SkillKit = Pick<Elements['terminal'], 'Box' | 'Text' | 'Button' | 'Link'> & Pick<MarkKit, 'Svg' | 'Image'>

/** The dim line for where a rating stands; undefined before one is given. */
export function skillSubOf(skill: UsedSkill): string | undefined {
  if (skill.sending) return 'Sending your rating…'
  if (skill.failed) return 'The rating could not be sent. Try again.'
  if (skill.rating === 'up') return 'Thanks. Your rating went to the skill\'s owner.'
  if (skill.rating === 'down') return `Thanks. Say what went wrong: /alis feedback ${skill.id} <what happened>`
  return undefined
}

/** The skill's row in the transcript. */
export function renderSkillRow(kit: SkillKit, surface: RenderSurface, skill: UsedSkill): RenderElement {
  const { Box, Text } = kit
  const sub = skill.rating ? skillSubOf(skill) : undefined
  return (
    <Box key="alis-skill" flexDirection="column">
      <Box flexDirection="row" alignItems="center">
        <Box width={slotCells(surface)} flexShrink={0}>
          {mark(kit, surface)}
        </Box>
        <Box flexShrink={0}>
          <Text>{`Skill ${skill.name}`}</Text>
        </Box>
        <Box flexShrink={1}>
          <Text color={KEY.quiet} wrap="truncate-end">{' · from the AlisX Skill store'}</Text>
        </Box>
      </Box>
      {sub ? under(kit, surface, sub, KEY.quiet) : null}
    </Box>
  )
}

/**
 * The line above the prompt: how did the skill go? The buttons take a click,
 * or their letter once the band has the focus (ctrl+x tab).
 */
export function renderSkillAsk(kit: SkillKit, surface: RenderSurface, skill: UsedSkill, actions: SkillActions): RenderElement {
  const { Box, Text, Button } = kit
  const sub = skillSubOf(skill)
  return (
    <Box key="alis-skill-ask" flexDirection="column">
      <Box flexDirection="row" alignItems="center">
        <Box width={slotCells(surface)} flexShrink={0}>
          {mark(kit, surface)}
        </Box>
        <Box flexShrink={1}>
          <Text wrap="truncate-end">{`How was the skill ${skill.name}?`}</Text>
        </Box>
        {skill.sending ? null : (
          <Box flexDirection="row" gap={1} marginLeft={2} flexShrink={0}>
            <Button key={`alis-skill-up:${skill.id}`} label="Helped" hotkey="y" variant="primary" onPress={() => actions.rate('up')} />
            <Button key={`alis-skill-down:${skill.id}`} label="Didn't help" hotkey="n" onPress={() => actions.rate('down')} />
            <Button key={`alis-skill-more:${skill.id}`} label="Say more" hotkey="m" onPress={actions.sayMore} />
            <Button key={`alis-skill-later:${skill.id}`} label="Not now" hotkey="x" dimColor role="dismiss" onPress={actions.dismiss} />
          </Box>
        )}
      </Box>
      {sub ? under(kit, surface, sub, skill.failed ? KEY.warning : KEY.quiet) : null}
    </Box>
  )
}
