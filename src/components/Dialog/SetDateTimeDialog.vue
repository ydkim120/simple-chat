<template>
  <Dialog
    v-model:visible="activeDialog"
    :header="props.header"
    :style="{ width: '500px' }"
    modal
    dismissable-mask
  >
    <div class="flex-auto reserve-time-wrap">
      <Calendar
        v-model="selectedDate"
        icon-display="input"
        :min-date="props.minDate"
        :date-format="props.dateFormat"
        show-icon
      />
      <Calendar
        v-model="selectedTime"
        icon-display="input"
        :step-minute="props.stepMinute"
        :min-date="dayjs(selectedDate).format('YYYY-MM-DD') === dayjs(props.minDate).format('YYYY-MM-DD')
          ? props.minDate
          : undefined"
        :date-format="props.timeFormat"
        show-icon
        time-only
        >
        <template #inputicon="{ clickCallback }">
          <i class="pi pi-clock" @click="clickCallback" />
        </template>
      </Calendar>
    </div>
    <template #footer>
      <Button
        label="취소"
        severity="secondary"
        @click="activeDialog = false"
      />
      <Button
        :label="props.saveButtonLabel"
        @click="saveTime()"
        autofocus
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import dayjs from 'dayjs'

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'save', result: Date): void
}>()

export interface Props {
  visible: boolean
  header?: string
  initDate?: Date | undefined
  minDate?: Date | undefined
  stepMinute?: number
  dateFormat?: string
  timeFormat?: string
  saveButtonLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  header: '메세지 예약',
  initDate: new Date(),
  minDate: undefined,
  stepMinute: 1,
  dateFormat: 'yy-mm-dd',
  timeFormat: ' ',
  saveButtonLabel: '저장'
})

const selectedDate = ref(new Date())
const selectedTime = ref<Date>(new Date())


const activeDialog = computed({
  get() {
    return props.visible
  },
  set(value) {
    emit('update:visible', value)
  }
})

watch(activeDialog, async (val) => {
  if (val) {
    setInitDateTime(props.initDate)
  }
})

/**
 * 초기 날짜 정보 세팅
 */
const setInitDateTime = async (initDate: Date) => {
  await nextTick()
  selectedDate.value = new Date(initDate)
  const currentMinute = selectedDate.value
    ? selectedDate.value.getMinutes()
    : props.minDate.getMinutes()

  const getStepMinutes = (currentMinute: any, step: number) => {
    return currentMinute % step === 0
      ? currentMinute
      : Math.ceil(currentMinute / step) * step
  }
  selectedTime.value = new Date(selectedDate.value.setMinutes(getStepMinutes(currentMinute, props.stepMinute)))
}



const saveTime = () => {
  if (!selectedDate.value) return alert('날짜를 설정해주세요.')
  if (!selectedTime.value) return alert('시간을 설정해주세요.')

  const result = new Date(selectedTime.value)
  result.setYear(dayjs(selectedDate.value).get('y'))
  result.setMonth(dayjs(selectedDate.value).get('M'))
  result.setDate(dayjs(selectedDate.value).get('D'))

  emit('save', result)
}
</script>

<style scoped>
  .reserve-time-wrap {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    & > * { flex: 1 1 auto; }
  }
</style>