import queries from '@/db/queries'
import { SelectLabel } from '@/db/schema'
import Button from '@/shared/components/Button'
import ButtonWrapper from '@/shared/components/ButtonWrapper'
import Label from '@/shared/components/Label'
import LabelFilterModal from '@/shared/components/LabelFilterModal'
import PageWrapper from '@/shared/components/PageWrapper'
import TextInput from '@/shared/components/TextInput'
import { context } from '@/shared/context'
import { URLParams } from '@/shared/types'
import { router, useLocalSearchParams } from 'expo-router'
import * as React from 'react'
import { SafeAreaView, View } from 'react-native'
import 'react-native-get-random-values'
import { ActivityIndicator } from 'react-native-paper'
import { useAsyncEffect } from 'use-async-effect'

const IdeaEdit = ({
  labelId,
}: {
  submitCallback: (ideaText: string) => void
  cancelCallback: () => void
  labelId: string
}) => {
  const [ideaText, setIdeaText] = React.useState('')
  const [label, setLabel] = React.useState<SelectLabel | null>(null)
  const { dispatch } = React.useContext(context)
  const params = useLocalSearchParams<URLParams['edit-idea']>()
  const [selectedLabelId, setSelectedLabelId] = React.useState('')
  const [labelList, setLabelList] = React.useState<SelectLabel[]>([])
  const [isModalVisible, setIsModalVisible] = React.useState(false)

  const onFilterSubmitCallback = React.useCallback(
    (id: string) => {
      setSelectedLabelId(id)
      setLabel(labelList.filter(l => l.id === id)[0])
      setIsModalVisible(false)
    },
    [labelList]
  )

  const onFilterCancelCallback = React.useCallback(() => {
    setIsModalVisible(false)
  }, [])

  useAsyncEffect(async () => {
    if (!params.ideaId) {
      dispatch({
        type: 'TOAST',
        payload: { message: 'Something went wrong', variant: 'ERROR' },
      })
      router.navigate('/')
      return
    }

    const idea = await queries.select.ideaById(params.ideaId)
    const label = await queries.select.labelById(idea.labelId)
    const labels = await queries.select.labels()
    setIdeaText(idea.text)
    setLabel(label)
    setLabelList(labels)
    setSelectedLabelId(idea.labelId)
  }, [labelId, params.ideaId])

  const handleCancel = React.useCallback(() => {
    router.back()
  }, [])

  const handleSubmit = React.useCallback(async () => {
    if (!params.ideaId) {
      dispatch({
        type: 'TOAST',
        payload: { message: 'Something went wrong', variant: 'ERROR' },
      })
      return
    }

    await queries.update.idea(params.ideaId, {
      text: ideaText,
      labelId: selectedLabelId,
    })
    router.back()
  }, [params.ideaId, ideaText, selectedLabelId, dispatch])

  if (label === null) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ActivityIndicator animating size="large" />
      </SafeAreaView>
    )
  }

  return (
    <PageWrapper>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <TextInput
          label=""
          value={ideaText}
          onChangeText={text => setIdeaText(text)}
          multiline
          color={label.color}
        />
        <Label {...label} handlePress={() => setIsModalVisible(true)} />
        <LabelFilterModal
          filterLabelList={labelList}
          onSubmit={onFilterSubmitCallback}
          onCancel={onFilterCancelCallback}
          isModalVisible={isModalVisible}
        />
      </View>

      <ButtonWrapper
        left={
          <Button color="warning" variant="link" onPress={handleCancel}>
            Cancel
          </Button>
        }
        right={
          <Button
            disabled={ideaText.length === 0}
            color="primary"
            variant="filled"
            onPress={handleSubmit}
          >
            Save
          </Button>
        }
      />
    </PageWrapper>
  )
}

export default IdeaEdit
