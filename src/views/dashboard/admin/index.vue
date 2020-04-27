<template>
  <div>
    <div class="dashboard-editor-container">
      <panel-group :user-name="list.username" @handleSetLineChartData="shownavi" />
    </div>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import Cookies from 'js-cookie'
export default {
  name: 'Admin',
  components: {
    PanelGroup
  },
  data() {
    return {
      imageUrl: '',
      dialogVisible: false,
      list: {},
      tablelist: [],
      action: this.$URL + '/collective/uploadFile',
      datas: { files: '' }
    }
  },
  created() {
    this.show()
  },
  methods: {
    shownavi(e) {
      // if (e === 'classTotal') {
      //   this.$router.push('/classset')
      // } else if(e === 'teacherTotal') {
      //  this.$router.push({path:'/addschool'});
      // } else {
      //   this.$router.push('/classstudent')
      // }
    },
    async show() {
      this.list = JSON.parse(Cookies.get('userInfo'))
      // console.log(this.list)
    }
  }
}
</script>

<style lang="scss" scoped>
.top {
  margin: 50px 0;
  color: #e8e8ee;
}
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
.avatar-uploader{
  width: 100%;
}
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    margin: auto;
    font-size: 20px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
    border: 2px solid #eee;
  }
  .avatar {
    width: 70%;
    // height: 600px;
    display: block;
    object-fit: cover;
    margin: auto;
    margin-bottom: 50px;
  }
</style>
