<template>
  <div>
    <div style="margin:20px 10%;">
      <el-table
        ref="multipleTable"
        v-loading="fullscreenLoading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column
          label="成员名称"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.roleName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="修改日期"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="权限"
          width="200"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.isAdmin === 1 && scope.row.isAll === 1">所有权限</span>
            <div v-for="item in scope.row.sysPermissionList" v-else :key="item.pId">
              <span>{{ item.perName }};</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.id!=1 && scope.row.id!=2"
              size="mini"
              @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top:40px;">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="counts"
          :current-page="currentpage"
          @current-change="changepage"
        />
      </div>
    </div>
    <el-dialog title="编辑权限" :visible.sync="dialogFormVisible" width="20%">
      <el-tree
        :data="data"
        node-key="id"
        show-checkbox
        :props="defaultProps"
        :default-expanded-keys="[8, 11]"
        @check-change="handleCheckChange"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addnewrole">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: [{
        id: 8,
        checked: false,
        label: '成员管理',
        children: [{
          id: 9,
          checked: false,
          label: '添加成员'
        }, {
          id: 10,
          checked: false,
          label: '成员分组权限'
        }]
      }, {
        id: 11,
        checked: false,
        label: '班级管理',
        children: [{
          id: 12,
          checked: false,
          label: '年级班级设置'
        }, {
          id: 13,
          checked: false,
          label: '班级学生列表'
        }, {
          id: 14,
          checked: false,
          label: '班级管理员列表'
        }]
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      tableData: [],
      dialogFormVisible: false,
      cuurentindex: 0,
      total: 0,
      counts: 10,
      currentpage: 1,
      fullscreenLoading: true
    }
  },
  created() {
    this.showAll()
  },
  methods: {
    changepage(e) {
      this.currentpage = e
      this.showAll()
    },
    async addnewrole() { // 确定
      var list = { id: this.tableData[this.cuurentindex].id, sysPermissionList: [] }
      for (var item of this.data) {
        if (item.checked === true) {
          list.sysPermissionList.push({ id: item.id })
        }
        for (var items of item.children) {
          if (items.checked === true) {
            list.sysPermissionList.push({ id: items.id })
          }
        }
      }
      // console.log(list)
      const cfg = {
        method: 'DELETE',
        url: this.$URL + '/member/permission/addAdminPermission',
        data: list,
        headers: 'json'
      }
      var ress = await this.$http(cfg)
      if (ress.data.data === 'SUCCESS') {
        this.$message({
          message: '编辑成功',
          type: 'success'
        })
      }
      this.dialogFormVisible = false
      this.showAll()
    },
    handleCheckChange(e, checked, indeterminate) {
      // console.log(e.id, checked)
      if (e.id === 8 || e.id === 11) {
        if (checked === true) {
          for (var item of this.data) {
            if (e.id === item.id) {
              item.checked = !item.checked
            }
          }
        }
      } else {
        for (var it of this.data) {
          if (e.id === it.id) {
            it.checked = !it.checked
          }
          for (var its of it.children) {
            if (e.id === its.id) {
              its.checked = !its.checked
            }
          }
        }
      }
      // console.log(this.data)
    },
    async showAll() {
      const cfg = {
        method: 'POST',
        url: this.$URL + '/member/permission/getPermissionListByRoleType/2?pageSize=10&page=' + this.currentpage,
        headers: 'json'
      }
      var res = await this.$http(cfg)
      this.tableData = res.data.data.rows
      this.total = res.data.data.records
      for (var item of this.tableData) {
        item.createTime = this.resolvingDate(item.createTime)
      }
      this.fullscreenLoading = false
    },
    handleEdit(index, row) { // 编辑
      this.dialogFormVisible = true
      this.cuurentindex = index
    }
  }
}
</script>
