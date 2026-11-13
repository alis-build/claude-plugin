/* @jsxRuntime classic */
/* @jsx h */
// The row of a tool call that loaded a Skill store skill: the mark, the
// skill by name, and, once the turn that used it has ended, the rating
// buttons. It stands in for the call's own result (the skill's text, which
// the model reads and the person does not need again).
import type { Elements, RenderElement, RenderSurface } from 'claude-code'

import { KEY, mark, type MarkKit } from './brand'
import { slotCells, under } from './ops-render'
import type { SkillActions, UsedSkill } from './skills-used'

export type SkillKit = Pick<Elements['terminal'], 'Box' | 'Text' | 'Button' | 'Link'> & Pick<MarkKit, 'Svg' | 'Image'>

/** The dim line under the skill's name, for where its rating stands. */
export function skillSubOf(skill: UsedSkill): string | undefined {
  if (skill.sending) return 'Sending your rating…'
  if (skill.failed) return 'The rating could not be sent. Try again.'
  if (skill.rating === 'up') return 'Thanks. Your rating went to the skill\'s owner.'
  if (skill.rating === 'down') return `Thanks. Say what went wrong: /alis feedback ${skill.id} <what happened>`
  return undefined
}

export function renderSkillRow(kit: SkillKit, surface: RenderSurface, skill: UsedSkill, actions: SkillActions): RenderElement {
  const { Box, Text, Button } = kit
  const sub = skillSubOf(skill)
  const asks = skill.turnDone && skill.canRate && !skill.rating && !skill.sending
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
      {sub ? under(kit, surface, sub, skill.failed ? KEY.warning : KEY.quiet) : null}
      {asks ? (
        <Box flexDirection="row">
          <Box width={slotCells(surface)} flexShrink={0} />
          <Box flexDirection="row" gap={1}>
            <Button key={`alis-skill-up:${skill.id}`} label="Helped" variant="primary" onPress={() => actions.rate('up')} />
            <Button key={`alis-skill-down:${skill.id}`} label="Didn't help" onPress={() => actions.rate('down')} />
            <Button key={`alis-skill-more:${skill.id}`} label="Say more" dimColor onPress={actions.sayMore} />
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}
