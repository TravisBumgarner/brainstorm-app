import { db } from '@/db/client'
import queries from '@/db/queries'
import { IdeasTable, NewIdea, SelectLabel } from '@/db/schema'
import Button from '@/shared/components/Button'
import ButtonWrapper from '@/shared/components/ButtonWrapper'
import Label from '@/shared/components/Label'
import PageWrapper from '@/shared/components/PageWrapper'
import { SPACING } from '@/shared/theme'
import * as React from 'react'
import { SafeAreaView, View } from 'react-native'
import 'react-native-get-random-values'
import { ActivityIndicator, TextInput, useTheme } from 'react-native-paper'
import { v4 as uuidv4 } from 'uuid'

const IdeaInput = ({
  submitCallback,
  cancelCallback,
  labelId,
}: {
  submitCallback: (ideaText: string) => void
  cancelCallback: () => void
  labelId: string
}) => {
  const [ideaText, setIdeaText] = React.useState('')
  const [label, setLabel] = React.useState<SelectLabel | null>(null)
  const theme = useTheme()
  React.useEffect(() => {
    queries.select.labelById(labelId).then(setLabel)
  }, [labelId])

  const handleCancel = React.useCallback(() => {
    setIdeaText('')
    cancelCallback()
  }, [cancelCallback])

  const handleSubmit = React.useCallback(async () => {
    const idea: NewIdea = {
      id: uuidv4(),
      text: ideaText,
      labelId: labelId,
      createdAt: new Date().toISOString(),
    }
    const result = await db
      .insert(IdeasTable)
      .values(idea)
      .returning({ uuid: IdeasTable.id })

    setIdeaText('')
    submitCallback(result[0].uuid)
  }, [submitCallback, ideaText, labelId])

  if (label === null) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ActivityIndicator animating size="large" />
      </SafeAreaView>
    )
  }

  return (
    <PageWrapper>
      <View style={{ marginBottom: SPACING.md }}>
        <Label
          color={label.color}
          icon={label.icon}
          text={label.text}
          readonly
        />
      </View>
      <View style={{ flex: 1 }}>
        <TextInput
          label="Spill it..."
          value={ideaText}
          onChangeText={text => setIdeaText(text)}
          multiline
        />
      </View>
      <ButtonWrapper
        left={
          <Button variant="error" onPress={handleCancel}>
            Cancel
          </Button>
        }
        right={
          <Button variant="primary" onPress={handleSubmit}>
            Submit
          </Button>
        }
      />
    </PageWrapper>
  )
}

export default IdeaInput
